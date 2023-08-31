---
layout: "../../layouts/blog-post.astro"
title: "Utilizando AWS EC2 para Deployment"
description: "Utilizar o serviço EC2 para Deployment de uma aplicação Node.js com PostgreSQL e Redis"
pubDate: "2023-08-28"
draft: false
---

### AWS EC2

![aws-ec2-logo](/aws-ec2-logo.png)

Máquinas virtuais (Virtual Machine/VM) permitem que sistemas operacionais rodem através de software em cima de máquina com hardware.

Amazon Web Services (AWS) possui um serviço para uso de máquinas virtuais. Amazon Elastic Compute Cloud (EC2) é o serviço em que se aluga máquinas virtuais por demanda. Uma máquina virtual pode ser usada para diferentes propósitos como hospedar um *app web server* com Node.js por exemplo, um banco de dados PostgreSQL, um serviço que precisa de um nível de liberdade que outros serviços não oferecem.

Para demonstrar a criação de uma instância *EC2* utilizarei um sistema construído em Node.js com Typescript, mas qualquer linguagem de programação pode ser utilizado para hospedar no EC2.

### Requisitos

 - Uma conta AWS
 - Uma aplicação em qualquer linguagem com Docker
 
### Criando a VM

Para iniciar vá até a página do serviço EC2 na AWS. É onde todas as instâncias AWS serão listadas e as principais informações estarão disponíveis.  

![ec2-instances-list](/aws-entry.png)

Ao clicar em "Launch Instance" você será redirecionado para uma página para definir as características e configurações da *VM*. Aqui pode escolher o número de instâncias em "Number of Instances", o nome da aplicação em "Name" e "AMI" ou *Amazon Machine Image*, que é o sistema operacional em que a *VM* rodará. Tem disponível diversas *AMI* como exemplo macOS, Ubuntu, Windows e Amazon Linux. O Amazon Linux é uma distribuição Linux baseada na distribuição Red Hat Enterprise Linux. Por padrão Amazon Linux vem selecionado.

![start-of-configuration](/aws-1.png)

Mais abaixo poderá escolher propriamente a configuração do "hardware" (não é hardware propriamente dito, é software emulando hardware por cima de servidores reais) da VM. Aqui temos as configuração mais simples até as mais robustas.

![instance-types](/aws-instance-types.png)

A próxima etapa é criar a chave para que possa conectar no servidor via SSH. Através dela poderemos configurar o servidor, instalar e inspecionar por dentro como qualquer máquina. O conhecimento de linha de comando nesse momento é essencial. A chave vem em um formato `.pem` para acesso guarde ela com segurança pois qualquer um com essa chave e o IP da sua máquina terá total acesso a ela.

```sh
ssh -i [ssh-key-in-pem] [user]@[ip-address-or-domain]
```

Para podermos nos conectar via SSH na máquina virtual e expor as portas corretas para acesso via browser da nossa aplicação precisamos configurar a parte de *Network*. Essa parte é bem simples, expomos a porta 22 para SSH e permitir que somente o nosso IP seja permitido conecta-lo e abrir a porta 80 (http) e 443 (https) para qualquer um que acessar. E pronto a nossa máquina virtual está pronta para ser criada.

![key-pair-and-network](/aws-3.1.png)

Após isso é somente se conectar e configurar para que sua aplicação seja executada na máquina virtual.

### Configuração da VM

Para essa parte vou instalar somente dois *softwares*: Docker e Docker Compose. Com ele posso rodar qualquer aplicação que preciso com o auxílio de *Docker Images* do DockerHub. E isso automatiza toda a parte de configuração que seria necessário para rodar a aplicação. EC2 com Docker é a combinação perfeita para a liberdade que se precisa em nível de sistema operacional e automatização dos processos cansativos e *error-prone* para nós humanos.

Primeiro instalamos o Docker com o gerenciador de pacotes `yum` (similar ao `apt` do Debian/Ubuntu)

```sh
sudo yum install docker
```

Agora o Docker pode ser executado com um simples:

```sh
docker
```

Caso peça privilegio de *superuser* (sudo), execute os seguintes comandos:

```sh
sudo usermod -a -G docker ec2-user
id ec2-user
# Reload a Linux user's group assignments to docker w/o logout
newgrp docker
```

Agora é necessário o Docker Compose. Para baixaremos um pacote e executaremos com `yum`

```sh
sudo curl -L https://download.docker.com/linux/centos/7/x86_64/stable/Packages/docker-compose-plugin-2.6.0-3.el7.x86_64.rpm -o ./compose-plugin.rpm
sudo yum install ./compose-plugin.rpm -y
```

Pronto. Os dois software estão instalados para ser utilizados.

### Pipeline de implatanção

Agora mostrarei o código de uma pipeline que implementei (nesse caso com GitHub Actions). Para que a pipeline seja executada corretamente utilizei dois arquivos de configuração do Docker. 

O `Dockerfile` com código para que app seja construído e rode em produção.

```dockerfile:Dockerfile
FROM node:16-bullseye-slim as base
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
  tini \
  && rm -rf /var/lib/apt/lists/*
RUN npm i -g pnpm@7.19.0
EXPOSE 8000
RUN mkdir /app && chown -R node:node /app
WORKDIR /app
USER node
COPY --chown=node:node package.json pnpm-lock.yaml ./
ENV CI true
RUN pnpm i && pnpm store prune

FROM base as source
COPY --chown=node:node . .

FROM source as integration-test
ENV NODE_ENV=test
ENV PATH=/app/node_modules/.bin:$PATH
RUN pnpm i && pnpm store prune
RUN pnpm eslint .
RUN pnpm prisma generate
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["pnpm", "integration-test:ci"]

# Essa é a parte principal e é onde o código de produção é construído e executado
FROM source as production
RUN pnpm build
ENV NODE_ENV=production
ENV PATH=/app/node_modules/.bin:$PATH
RUN pnpm i && pnpm store prune
RUN pnpm prisma generate
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "./dist/server.js"]
```

 Um arquivo `docker-compose.yml` para facilitar a construção e o gerenciamento dos containers.
 
```yaml:docker-compose.yml
version: '3.7'
services:
  proxy-reverse:
    profiles: ['production']
    container_name: ecommerce_proxy_reverse
    image: nginx
    ports:
      - 80:80
    restart: unless-stopped
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - api-rest-app
  api-rest-app:
    profiles: ['production']
    image: matheusinit/ecommerce-api
    ports:
      - 8000:8000
    environment:
      ACCESS_TOKEN_SECRET: ${ACCESS_TOKEN_SECRET}
      REFRESH_TOKEN_SECRET: ${REFRESH_TOKEN_SECRET}
      PORT: ${PORT}
      REDIS_URL: ${REDIS_URL}
      DATABASE_URL: ${DATABASE_URL}
    depends_on:
      - database
      - cache
  api-rest-dev:
    profiles: ['development']
    build: .
    ports:
      - 8000:8000
    depends_on:
      - database
      - cache
  database:
    profiles: ['production', 'development']
    container_name: ecommerce_db
    image: postgres:14
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-changeme}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - /usr/docker/postgresql/ecommerce/:/data/postgres
    ports:
      - "5432:5432"
    restart: unless-stopped
  cache:
    profiles: ['production', 'development', 'testing']
    image: redis:alpine
    restart: unless-stopped
    ports:
      - "6379:6379"
    command: redis-server --save 20 1 --loglevel warning --requirepass ${REDIS_PASSWORD}
    volumes:
      - /usr/docker/cache/ecommerce/:/data
    environment:
      REDIS_PASSWORD: ${REDIS_PASSWORD}
  testing-database:
    profiles: ['testing']
    container_name: ecommerce_db_testing
    image: postgres:14
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-changeme}
      POSTGRES_DB: ${POSTGRES_DB}
    command: postgres -c fsync=off -c synchronous_commit=off -c full_page_writes=off -c random_page_cost=1.0
    tmpfs: /var/lib/postgresql/data
    env_file: .env.test.ci
    ports:
      - "5440:5432"
  integration_tests:
    profiles: ['testing']
    container_name: ecommerce_integration_tests
    build:
      context: .
      target: integration-test
    env_file: .env.test.ci
    depends_on:
      - testing-database
      - cache
volumes:
  cache:
    driver: local
```

O arquivo tem alguns containers que são necessário para produção e outros que servem para desenvolvimento ou para ambiente de *CI* (*Continuous Integration*). O containers de ambiente de produção são aqueles com `'production'` na propriedade `profiles`. Todos os outros não são necessários para que esta pipeline seja executado ou entendida.

```yaml:.github/workflows/continuous_deployment.yml
name: 'Continuous Deployment'
on:
  push:
    branches:
      - master
env:
  ACCESS_TOKEN_SECRET: ${{ secrets.ACCESS_TOKEN_SECRET }}
  REFRESH_TOKEN_SECRET: ${{ secrets.REFRESH_TOKEN_SECRET }}
  PORT: ${{ secrets.PORT }}
  POSTGRES_DB: ${{ secrets.POSTGRES_DB }}
  POSTGRES_USER: ${{ secrets.POSTGRES_USER }}
  POSTGRES_PASSWORD: ${{ secrets.POSTGRES_PASSWORD }}
  REDIS_PASSWORD: ${{ secrets.REDIS_PASSWORD }}
  REDIS_URL: ${{ secrets.REDIS_URL }}
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
jobs:
  build-and-deploy:
    runs-on: ubuntu-22.04
    environment: Deployment
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Login to DockerHub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_LOGIN }}
          password: ${{ secrets.DOCKERHUB_PASSWORD }}
      - name: Setup buildx
        uses: docker/setup-buildx-action@v2.5.0
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          push: true
          tags: matheusinit/ecommerce-api:latest
          target: production
      - name: Copy Docker Compose file to Virtual Server
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.VIRTUAL_SERVER_HOST }}
          username: ec2-user
          port: 22
          key: ${{ secrets.PRIVATE_KEY }}
          source: './docker-compose.yml'
          target: '.'
      - name: Create .env file
        run: |
          touch .env
          echo "DATABASE_URL=$DATABASE_URL" | tr " " "\n" >> .env
          echo "ACCESS_TOKEN_SECRET=$ACCESS_TOKEN_SECRET" | tr " " "\n" >> .env
          echo "REFRESH_TOKEN_SECRET=$REFRESH_TOKEN_SECRET" | tr " " "\n" >> .env
          echo "PORT=$PORT" | tr " " "\n" >> .env
          echo "REDIS_PASSWORD=$REDIS_PASSWORD" | tr " " "\n" >> .env
          echo "REDIS_URL=$REDIS_URL" | tr " " "\n" >> .env
          echo "POSTGRES_USER=$POSTGRES_USER" | tr " " "\n" >> .env
          echo "POSTGRES_PASSWORD=$POSTGRES_PASSWORD" | tr " " "\n" >> .env
          echo "POSTGRES_DB=$POSTGRES_DB" | tr " " "\n" >> .env
      - name: Copy .env file to Virtual Server
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.VIRTUAL_SERVER_HOST }}
          username: ec2-user
          port: 22
          key: ${{ secrets.PRIVATE_KEY }}
          source: './.env'
          target: '.'
      - name: Copy nginx.conf file to Virtual Server
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.VIRTUAL_SERVER_HOST }}
          username: ec2-user
          port: 22
          key: ${{ secrets.PRIVATE_KEY }}
          source: './infra/nginx.conf'
          target: '.'
      - name: Docker Pull & Run in Virtual Server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VIRTUAL_SERVER_HOST }}
          username: ec2-user
          key: ${{ secrets.PRIVATE_KEY }}
          envs: ${{ github.sha }}
          script: |
            docker pull matheusinit/ecommerce-api:latest
            docker compose down
            docker compose up -d proxy-reverse
            rm docker-compose.yml
            rm .env
```

Nesse parte eu estou realizado uma sequência de operações para que no final eu tenha meu app na AWS EC2.
- Defino todas as variáveis de ambiente para a construção dos containers (Node.js app, o banco de dados PostgreSQL e o Redis para armazenamento em memória).
- Utilizo `actions/checkout` para baixar o código do repositório para o ambiente em que pipeline está sendo executada. `actions/checkout` é uma action, pense como uma abstração para um script para atingir um resultado ou um produto.
- Com o comando anterior obtemos os dois arquivos de configuração do Docker. Agora o login para DockerHub será efetuado e então dar um equivalente a um `git push` para o repositório de *Docker Images* do DockerHub. O meu repositório é o `matheusinit/ecommerce-api`.
- Agora vou copiar os arquivos necessários para a execução dos containers utilizando o comando `scp`. Eles são o `docker-compose.yml`, `.env` (criado utilizando as variáveis ambientes definidas anteriormente) e `nginx.conf` para a execução do *Nginx*
- Por último um script será executado com o comando `ssh`. O script baixará/atualizará o *Docker Image* do comando anterior, derrubará os containers em execução do `docker-compose.yml`, se tiver algum container ativo, construíra os containers a partir do container `proxy-reverse` e seus dependentes e é deletado os arquivos `docker-compose.yml` e `.env`.

### Resultado

O código utilizado está disponível no repositório [Ecommerce API](https://github.com/matheusinit/ecommerce-api).

O app está rodando e sendo exposto com o serviço EC2 da AWS. Um domínio é oferecido para acesso, como pode ser visto o meu é *ec2-3-145-114-176.us-east-2.compute.amazonaws.com*, o que torna melhor do que somente um IPv4.

![app-in-production](/aws-app-prod.png)

Algumas melhorias que podem ser feitas a partir do resultado:
 - Utilizar HTTPS para encriptação nas requisições
 - Introduzir um processo de versionamento do app
 - Utilizar uma solução de monitoramento para que erros sejam identificados e métricas sejam analisadas para tomadas de decisões futuras em relação a arquitetura e a solução

Nesse exemplo, eu hospedei um banco de dados, o app e um banco de dados em memória em uma máquina com especificações baixas. Isso funciona quando não há tantas requisições e para sistemas com baixo tráfego, mas quando as necessidades aumentam a arquitetura vai clamar para mudanças. Como essa arquitetura seria? E que soluções seriam utilizadas? Não sei ainda. Mas saiba que essa arquitetura é limitante.

Algumas dúvidas em relação ao EC2:
- Qual a diferença entre EC2 e ECS (solução de hospedagem de containers)? Quando utilizar cada um?
- O que as duas soluções diferem da solução Elastic Beanstalk?
- Qual o limite dessa arquitetura em relação a quantidade usuários e tráfego? Qual solução de arquitetura seria a indicada quando a quantidade de usuários aumentar?

Dúvidas devem ser questionadas a si mesmo ao terminar uma etapa do projeto.

> *Be kind to yourself*

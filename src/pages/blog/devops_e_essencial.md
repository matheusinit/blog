---
layout: "../../layouts/blog-post.astro"
title: "DevOps é essencial"
description: "Introduzir conceitos de DevOps e como pode ser aplicado utilizando Github Actions"
pubDate: "2023-04-21"
draft: false
---
### O que é DevOps?

DevOps é uma cultura de princípios desenvolvidos baseado no [Manifesto Ágil](https://agilemanifesto.org/history.html) para aproximar o desenvolvimento do **deployment** do software. O próprio nome DevOps significa **Dev** de *software development* e **Ops** de *IT Operations*. Um dos problemas que software passou na sua jornada foi o processo como o **deployment** (implantação) era feito.

DevOps começou mais ou menos em 2009 com Patrick Debois, considerado o pai do DevOps. Ele sendo um desenvolvedor e parte do operacional, queria aproximar o dois times. O que faz sentido porque imagina a dificuldade que é desenvolvedor sem ter noção de como ser implantado ou implantar o software sem saber detalhes de como o código foi desenvolvido. E isso gerava problemas, e para evitar erros de produção a implantação não era frequente, com meses sem implantação de software.

Como as implantações eram feitas de formas manuais, a chance de erros acontecerem eram significativas. Já que onde há a ação humana, há  a chance de erros. Assim o DevOps vem com a missão de minimizar os erros humanos, minimizando a ação humana o máximo possível. Como isso poderia ser feito? Software. Gerando um software que automatizasse tudo que o humano fizesse e transformasse isso numa receita de bolo automatizada independente, e problema resolvido.

Com o operacional muito mais próximo do software, isso aproxima os dois lados do DevOps ou até mesmo unifica. Com isso conseguimos várias implantações por dia, funcionalidades e resultados mais rápidas para os clientes, ambientes de testes similares ao de produção para **QA**, menos problemas causados por erro na implantação.

### Github Actions

Github Actions é uma ferramenta do Github para automatização de scripts em repositórios do Github. Mas para demonstrar os conceitos de DevOps, não precisa especificamente dele. Há outras ferramentas similares como Jenkins, CircleCI ou Gitlab CI (solução do Gitlab). Então os conceitos apresentados pelo Github Actions é totalmente transferível. Então a tecnologia não importa.

Recenemente criei um [projeto](https://github.com/matheusinit/LembrarMe/) para colocar em prática conceitos de DevOps com uma API Rest bem simples e básica. Minha inteção mais era testar Github Actions e configuração do Nginx com HTTPS.

Nesse projeto criei algumas pipelines. Pipeline é um conjunto de scripts para se obter um resultado ou produto do software. Por exemplo criei uma pipeline chamada *Unit tests* para rodar testes unitários.

```yaml
name: 'Unit tests'
on: [push, workflow_call]
jobs:
  test:
    runs-on: ubuntu-22.04
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Generate package-lock.json
        run: npm i --package-lock-only
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      - name: Install deps
        run: npm ci
      - name: 'Run unit tests'
        run: npm run test
```

O arquivo acima é um arquivo .yml no path .github/workflows. Aqui é onde ficará toda a configuração para essa pipeline.

*O que o arquivo está fazendo?*
- **name**: É o nome da pipeline, ou no Github Actions o nome dado é Workflow
- **on**: Quando essa pipeline será acionada
	Aqui defini no **push** de commits no repositório e em **workflow_call** que permite que seja executado quando um outro workflow tentar executar esse workflow.
- **jobs**: Job é uma serie de scripts que rodam pelo o mesmo *runner*.
	Nesse exemplo, tem somente um job chamado **test**.
- **runs-on**: Definimos o *runner*, descrito em anteriormente, para o job. Aqui estou definindo o Ubuntu versão 22.04. 
	Github actions executa os runners em Máquinas virtuais. Tem disponível os sistemas operacionais como runners, Ubnuntu Linux, WIndows ou MacOS. [Para saber mais detalhes](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners)
- **steps**: São os scripts para ser executado. Para **step** definimos **name**, e ou **uses** ou **run** para rodar os scripts.
	No primeiro usamos um script do próprio do Github para baixar o repositório de actions/checkout com a versão 3 (v3). E outro utilizado, é o step *Run unit tests* que executa um comando no runner npm run test descrito em **run**.

Essa é a configuração de uma pipeline de testes, mas pode ser criadas muitas outras. Como por exemplo um de **release** para ser acionado em quando der um push de commit para a branch principal.

```yaml
name: Release
on:
  push:
    branches:
      - master
jobs:
  test:
    name: Test
    uses: ./.github/workflows/tests.yml
  docker:
    name: Build container
    runs-on: ubuntu-22.04
    steps:
      - name: "☁️ checkout repository"
        uses: actions/checkout@v3
      - name: Login to docker
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_LOGIN }}
          password: ${{ secrets.DOCKERHUB_PASSWORD }}
      - name: "🔧 setup buildx"
        uses: docker/setup-buildx-action@v2.5.0
      - name: "🔧 cache docker layers"
        uses: actions/cache@v3
        with:
          path: /tmp/.buildx-cache
          key: ${{ runner.os }}-buildx-${{ github.sha }}
      - name: "🔧 docker meta"
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: ${{ github.repository }}
          tags: latest
      - name: "📦 docker build"
        uses: docker/build-push-action@v4
        with:
          push: false
          load: true
          tags: ${{ github.run_id }}

      - name: Run CVEs scan (Trivy non-blocking)
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ github.run_id }}
          exit-code: 0
          format: table

      - name: Run Trivy for HIGH,CRITICAL CVEs and report (blocking)
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ github.run_id }}
          exit-code: 1
          ignore-unfixed: true
          vuln-type: "os,library"
          severity: "HIGH,CRITICAL"
          format: "sarif"
          output: "trivy-results.sarif"

  release:
    name: Release in deploy server
    needs:
      - test
      - docker
    runs-on: ubuntu-20.04
    steps:
      - name: "☁️ checkout repository"
        uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - name: "🚀 release"
        run: |
          echo "DATABASE_URL=${{ secrets.DATABASE_URL }}" >> .env
          echo "POSTGRES_DB=${{ secrets.POSTGRES_DB }}" >> .env
          echo "POSTGRES_USER=${{ secrets.POSTGRES_USER }}" >> .env
          echo "POSTGRES_PASSWORD=${{ secrets.POSTGRES_PASSWORD }}" >> .env

          echo "${{ secrets.CERT_FILE }}" | tr -d '\r' > cert.pem
          chmod 400 cert.pem
          scp -i cert.pem -o "StrictHostKeyChecking=no" ./.env ${{ secrets.DEPLOY_SERVER }}:~/nodejs_cicd/.env
          scp -i cert.pem -o "StrictHostKeyChecking=no" ./docker-compose.yml ${{ secrets.DEPLOY_SERVER }}:~/nodejs_cicd/docker-compose.yml
          scp -i cert.pem -o "StrictHostKeyChecking=no" ./default.conf ${{ secrets.DEPLOY_SERVER }}:~/nodejs_cicd/
          ssh -i cert.pem -o "StrictHostKeyChecking=no" ${{ secrets.DEPLOY_SERVER }} << 'ENDSSH'
            cd ~/nodejs_cicd
            docker compose down
            docker compose pull
            docker compose up --build -d

            docker image prune -f
            rm ./docker-compose.yml
            rm ./default.conf
            rm ./.env
          ENDSSH
```

Aqui é uma pipeline de release utilizando uma máquina virtual como servidor. E como pode ser visto lá em cima no trecho:

```yaml
[...]

on:
  push:
    branches:
      - master

[...]
```

A pipeline será somente acionada no push na branch master.

Assim como temos outras funcionalidades da ferramente, como depedências entre **jobs**, reutilização de **pipelines**, utilização de Docker containers. Então para saber mais sempre conte com a [documentação do Github Actions](https://docs.github.com/en/actions).

### Referências
- https://en.wikipedia.org/wiki/DevOps
- https://www.startechup.com/blog/history-of-devops/
- https://agilemanifesto.org/
- https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners
- https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions
- https://github.com/matheusinit/LembrarMe/

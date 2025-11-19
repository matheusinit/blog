---
title: Utilizando Elastic Beanstalk e RDS com ASP.NET Core
date: "2023-09-06"
slug: aws-utilizando-elastic-beanstalk-e-rds-com-aspnet-core
tags:
  - ci-cd
  - devops
  - github-actions
draft: false
---

### Introdução

![RDS](https://d1.awsstatic.com/video-thumbs/RDS/product-page-diagram_Amazon-RDS-Regular-Deployment_HIW-V2.96bc5b3027474538840af756a5f2c636093f311f.png)

Em um [blog post recente](https://matheusinit.vercel.app/blog/utilizando_aws_ec2_para_deployment), eu demonstrei o *deployment* de uma aplicação utilizando AWS EC2 com o banco de dados na mesma *VM*. Mas nesse post eu quero fazer diferente e utilizar diferentes *VM* para o banco de dados e o app. Para isso vou utilizar a solução Elastic Beanstalk para o app e AWS RDS para o banco de dados com o PostgreSQL. O app nessa solução é uma aplicação ASP.NET Core exemplo baixada de um tutorial, foram feitas algumas modificações para funcionar com PostgreSQL.
### Virtualização

Para entender como esses serviços funcionam e começar a entender as *features*, é preciso entender virtualização. Virtualização é a capacidade de criar recursos como *servers*, *storage* e outros recursos físicos através de *software*. Um exemplo é utilizar Oracle VirtualBox para rodar um sistema operacional baseado em Linux. Cada *Virtual machine* tem seu próprio kernel, o núcleo de um sistema operacional. Isso é virtualização. 

![virtualization](https://static.wixstatic.com/media/bec156_c642092c3ee6475b842df886561a52b6~mv2.png/v1/fill/w_640,h_290,al_c,lg_1,q_85,enc_auto/bec156_c642092c3ee6475b842df886561a52b6~mv2.png)

Para que a virtualização funcione, precisamos de algo que gerencie os recursos para cada *VM*. Isso é trabalho para o *Hypervisor*. Existem dois tipos de *Hypervisor*, o tipo 1, ou *bare-metal hypervisor*, é instalado no *hardware* invés de instalar em um *OS (Operating System)* e este tipo vem com um kernel para que não seja preciso instalar um *OS*.  Essa opção é ideal para *AWS* por ser mais performática por não ter que comunicar com um *OS* e sim diretamente com o *kernel*. O tipo 2 é instalado em um *OS* e não vem com *kernel* pois já possui o *kernel* do *OS*, exemplo é *VMWare* e *Oracle VirtualBox*. Essa opção acaba sendo mais lento e então são destinados a usuários e não *enterprises* como AWS.

*Virtual Machine Manager (VMM)* é outro nome para *hypervisor*. Como mostrado abaixo para a virtualização funcionar é preciso uma tradução do binário da *VM* rodando para o *kernel* que está rodando nativamente. Isso oferece compatibilidade com diferentes *kernels* mas é menos performático que a outra opção a seguir. Esse tipo de virtualização também é chamado de *Full virtualization*.

![full-virtualization](https://ars.els-cdn.com/content/image/3-s2.0-B9781597495578000011-f01-05.jpg)

A AWS utiliza dois tipos específicos de virtualização: *Paravirtual* e *Hardware Virtual Machine (HVM)*. *HVM* é outro nome para *Full virtualization*. Para ambas as solução é utilizado [Xen](https://xenproject.org).

*Paravirtual* é um tipo de virtualização em que a tradução binária não é feita, e o *VM* utiliza os binários do próprio *kernel* instalado. Para se comunicar com *hypervisor* é utilizado *hypercall* que tem o mesmo sentido do que uma [*system call*](https://en.wikipedia.org/wiki/System_call) mas para o *hypervisor*. Isso o torna mais performático mas não suporta qualquer *OS*, como Windows. 

![](https://ars.els-cdn.com/content/image/3-s2.0-B9781597495578000011-f01-07.jpg)


AWS tem começado a utilizado [KVM instead of Xen](https://www.freecodecamp.org/news/aws-just-announced-a-move-from-xen-towards-kvm-so-what-is-kvm/).
### Elastic Beanstalk

AWS Elastic Beanstalk é uma solução que utiliza a AWS EC2 junto com um ambiente de produção automatizado. Não é preciso configurar o ambiente de produção diretamente via *cli*. Elastic Beanstalk custa nada, o que custa é as instâncias de AWS EC2 rodando por baixo. Com essa solução a implantação é rápida e sem o gerenciamento de lidar com uma *VM* da AWS EC2 diretamente, pois isso é feito pelo Beanstalk.

### Relational Database Service

AWS RDS é a solução para banco de dados que assim como Beanstalk utiliza EC2 como abstração e automatiza o processo de configuração da *VM*, backup e escalabilidade, tirando essas responsabilidades do cliente e gerenciando-as por nós. Se utilizasse uma simples *VM* com EC2 teriamos que gerenciar a VM, os pacotes, atualizações, possíveis bugs que apareceriam, backups, escalabilidade, etc. AWS RDS diminui as nossas responsabilidades com o banco de dados. É suportado diferentes *DBMS* como SQL Server, PostgreSQL, Oracle, MariaDB e MySQL.

![RDS Configuration](/aws-utilizando-elastic-beanstalk-e-rds-com-aspnet-core/aws-rds-1.png)

### Configuração do RDS

Na página inicial de configuração, escolhemos nossa "Engine" ou *DBMS*. Entre as opções temos: PostgreSQL, Oracle, SQL Server, MySQL, entre outros. Nesse experimento eu utilizarei o PostgreSQL por ser elegível ao **Free tier**.

![RDS Configuration Step 01](/aws-utilizando-elastic-beanstalk-e-rds-com-aspnet-core/aws-rds-2.png)

Novamente, por eu escolher os benefícios do **Free tier**, o *template* utilizado é o "Free tier".

![RDS Configuration Step 02](/aws-utilizando-elastic-beanstalk-e-rds-com-aspnet-core/aws-rds-3.png)

Essa é parte mais importante. Aqui definiremos o nome do banco de dados em "DB instance identifier". O nome do usuário em "Master username" e a senha para o usuário em "Master password". Com essas informações que será feita a conexão entre a aplicação e o banco de dados, então **não perca** e **não vaze**. Eles são dados que comprometem com a segurança da sua aplicação e dados.

![RDS Configuration Step 03](/aws-utilizando-elastic-beanstalk-e-rds-com-aspnet-core/aws-rds-4.png)

Em "Instance configuration", foi escolhida a instância "db.t4g.micro" para a *VM*. Uma bem pequena e elegível a **Free tier**. E **desabilite** a opção "Enable storage autoscaling" se ativada. Com essa opção AWS irá aumentar o tamanho do capacidade do disco *SSD* quando estiver perto de acabar. Como faz isso? Virtualização é a resposta.

![RDS Configuration Step 04](/aws-utilizando-elastic-beanstalk-e-rds-com-aspnet-core/aws-rds-5.png)

Nessa parte podemos deixar as opções padrões. Aqui é a configuração do "VPC", "subnet group" e do *firewall*.

![RDS Configuration Step 05](/aws-utilizando-elastic-beanstalk-e-rds-com-aspnet-core/aws-rds-6.png)

Novamente, deixe as opções padrões. O "VPC" selecionado deve ser o mesmo que será utilizado no *app* com Elastic Beanstalk. Em "Public access" está selecionado "No" para que não possa ser acessado através de um IP público, ou seja, para qualquer um que esteja fora do *VPC*. **Não exponha seu banco de dados para o mundo**

![RDS Configuration Step 06](/aws-utilizando-elastic-beanstalk-e-rds-com-aspnet-core/aws-rds-6.png)

É, você já sabe, tudo padrão.

![RDS Configuration Step 07](/aws-utilizando-elastic-beanstalk-e-rds-com-aspnet-core/aws-rds-7.png)

Novamente, tudo padrão.

![RDS Configuration Step 08](/aws-utilizando-elastic-beanstalk-e-rds-com-aspnet-core/aws-rds-8.png)

### Configuração do Beanstalk

Antes de começar com a configuração, precisamos nos certificar que a aplicação esteja sendo exposta na porta 5000. 5000 é a porta que o Elastic Beanstalk espera que definida para então ser exposto na 80 quando acessarmos a aplicação em produção (Acredito que esteja utilizando Nginx para fazer o esse redirecionamento funcionar).

Bom, a configuração do Beanstalk simplifica muito hospedar uma aplicação. Nessa parte definimos o nome da aplicação em "Application Name" e o "environment" que é onde nossas configurações serão definidas e preciso dar um nome a ela.

![EB Configuration Step 01](/aws-utilizando-elastic-beanstalk-e-rds-com-aspnet-core/aws-bs-1.png)

Aqui será a parte em que definiremos o linguagem e como executaremos ela na máquina EC2 (Beanstalk é uma abstração do EC2). Vou escolher ".NET Core on Linux", porque estou utilizando uma aplicação em ASP.NET Core, um framework que pertence ao .NET Core. Aqui tem disponíveis outras linguagens, como Node.js, PHP, Go, Java, etc, e uma das opções é Docker. Com ele qualquer linguagem terá suporte então se tem o seu Dockerfile e docker-compose.yml pronto, só mandar ver.

E então devemos fornecer o nosso código, em "Local file" podemos dar upload em um arquivo .zip do código de produção da aplicação. Bom essa parte foi uma das partes que mais tive dificuldade. No caso de ASP.NET, para gerar essa *build* precisamos rodar o comando:

```sh
dotnet publish -o UrlRedirector
```

Com esse comando uma nova pasta será criado com somente .dll e arquivos de configuração. A sua linguagem também deve ter isso. Mais um exemplo é uma aplicação de Typescript em que geramos a pasta dist com um monte de arquivos .js. Essa é a nossa *build* de produção

![EB Configuration Step 02](/aws-utilizando-elastic-beanstalk-e-rds-com-aspnet-core/aws-bs-2.png)

Por fim, é definido um "Preset", aqui temos dois tipos de escolha:

- Single instance: Com esse preset vai conter somente uma instância EC2 com IP address disponível, somente. Esse caso serve bem quando você não espera muito tráfego na sua aplicação ou está utilizando para um ambiente de testes como *staging*.
- High availability: É utilizando um *load balancer* para dividir os *requests* em diferentes máquinas EC2 com a sua aplicação. Se a quantidade de *requests* diminui a número de instâncias EC2 também vai. Isso vai acontecer até um número especifico de instâncias, que é definido nas configurações do Beanstalk. Esse é o ótimo para os casos que tem muitas requisições em algum certo momento, pois se não ocorrer sempre não vai ser utilizado desnecessariamente instâncias EC2.

Se caso, foi escolhido "Single instance", não tem problema, pois pode ser mudado para "High availability". Então se estiver em dúvida comece com uma aplicação Single instance e se ver que há necessidade para uma configuração que suporte mais carga, vá para "High availability".

![EB Configuration Step 03](/aws-utilizando-elastic-beanstalk-e-rds-com-aspnet-core/aws-b2-3.png)

Nessa parte, temos que escolher "Service roles". Isso permite restringir quem têm acesso a esse recurso em específico, então é sempre recomendado restringir ao máximo as permissões e acessos externos. Essa foi uma das partes que eu não conseguia fazer funcionar e não sabia o porquê, caso aqui não apareça um "Service role" para selecionar, crie um, por que é necessário.

![EB Configuration Step 04](/aws-utilizando-elastic-beanstalk-e-rds-com-aspnet-core/aws-bs-5.png)

Nessa parte criaremos o VPC (Virtual Private Cloud), o recurso que traz uma segurança e isolamento entre os serviços. Então se o seu serviço se comunica de outro serviço AWS, eles precisam estar no mesmo VPC. E mais abaixo em "Instance subnets", definimos em que seção de endereço IP será executado a aplicação. 

![EB Configuration Step 05](/aws-utilizando-elastic-beanstalk-e-rds-com-aspnet-core/aws-bs-6.png)

Aqui escolhemos o "subnet" em que o banco de dados está rodando, se caso utilizar um. E caso não tenha criando ainda um banco de dados podemos criar por aqui mesmo. Dê um *check* em "Enable database" e adicione as informações e configurações do banco de dados.

![EB Configuration Step 06](/aws-utilizando-elastic-beanstalk-e-rds-com-aspnet-core/aws-bs-7.png)

"Security group" é o que define as permissões dos recursos na VPC escolhida, por exemplo as portas que vão estar abertas, como 5432, 80, 443 ou 22.

![EB Configuration Step 07](/aws-utilizando-elastic-beanstalk-e-rds-com-aspnet-core/aws-bs-9.png)

Após isso, utilizei as configurações padrões. Então continuei avança a próxima etapa até confirmar a configuração do ambiente. E então o resultado que terá é esse. Para ver se sua aplicação foi configurada corretamente, cheque se "Health" está com "OK". Se caso não estiver vá na aba "Logs", então baixe todos os logs e inspecione o que os logs dizem (essa é uma habilidade recompensadora de ter).

![EB Configuration Result](/aws-utilizando-elastic-beanstalk-e-rds-com-aspnet-core/aws-bs-result.png)

### Resultado

O resultado posso ver visto nos seguintes prints de tela.

![Tela 1 do resultado](/aws-utilizando-elastic-beanstalk-e-rds-com-aspnet-core/aws-result.png)

![Tela 2 do resultado](/aws-utilizando-elastic-beanstalk-e-rds-com-aspnet-core/aws-result-1.png)

![Tela 3 do resultado](/aws-utilizando-elastic-beanstalk-e-rds-com-aspnet-core/aws-result-2.png)

### Dúvidas
Algumas dúvidas que ficaram depois desse exercício. (Se não tivesse nenhuma seria estranho)
- O que pode ser feito com VPC?
- Qual a diferença de performance de uma *VM* com o *app* e o banco de dados para arquitetura distribuída em nuvem em que cada serviço tem sua *VM*?
- O que realmente são *subnets*?

Bom, esse exercício me fez pensar que no final de tudo é recursos de máquina mas não sei se essa arquitetura serve para aplicações com pouco tráfego, acho que é um pouco demais. Mas é isso que quero descobrir em breve, o quanto de carga cada uma aguenta?
### Links
- Elastic Beanstalk: https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/Welcome.html
- Amazon Machine Images (AMI): https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AMIs.html
- What is Virtualization: https://aws.amazon.com/what-is/virtualization/

> *Be in peace*

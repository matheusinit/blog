---
layout: "../../layouts/blog-post.astro"
title: "(AWS) Container Orchestration com AWS ECS em cluster EC2 com Load Balancer"
description: "Usando do serviço AWS ECS para orquestrar uma aplicação em Docker container junto com instâncias EC2 e Elastic Load Balancer"
pubDate: "2023-11-09"
draft: false
---

### Introdução

![AWS ECS](/ecs-cluster-ec2/03-aws-ecs.jpg)

AWS Elastic Container Service é a solução desenvolvida pela AWS  para orquestração de containers. É uma das formas de realizar *deploy* de Docker Images na AWS. Nesse blog post mostrarei o meu aprendizado e método para o *deploy* de Docker containers na AWS.

#### Pré requisitos

Para entender e repetir o que está sendo feito aqui é necessário:

- Uma conta na AWS
- Conhecimentos sobre Docker containers

### O que é AWS ECS?

AWS Elastic Container Service, ou ECS, é a solução da AWS para escalar, realizar *deploy* e gerenciar aplicações em containers. Isso que a AWS ECS faz é chamado de Container Orchestration. 

Com um orquestrador você escreve um arquivo de configuração com o resultado que você deseja dos containers, por exemplo, eu desejo que haja 4 containers rodando de um microserviço de vendas, então ele vai garantir que haja 4 containers desse microserviço rodando. Caso um dos containers falhe ou pare de rodar por algum motivo, ele vai criar um novo container para substituir-lo. Essa é a automação de containers pelo orquestrador.

Além disso *Container Orchestrator* pode:

 - Realizar deployment de containers
 - *Scale up* and *Scale down* containers
 - Monitorar Container Health (a saúde dos containers)

> Uma solução alternativa para AWS ECS é a ferramenta Kubernetes

*Container Orchestration* é uma boa escolha quando há inúmeros microservices com várias instâncias. Quanto maior a quantidade de serviços e instâncias desses serviços, mais trabalho é necessário para gerenciar-los manualmente. Nesse caso uma solução como *AWS ECS* ou *Kubernetes* é uma boa escolha.

No entanto, quando há poucos serviços, de 2 a 4 serviços por exemplo, com 2 ou 3 instâncias cada, eu me pergunto se vale a pena utilizar *Kubernetes* invés de um simples Docker ou Podman. Apesar de um *Orchestrator* trazer benefícios, mas também traz complexidades, podem ser citados:

- Novos conhecimentos (*Networking*, *DevOps*, etc)
- *Orchestration* pode ser imprevisível se não souber exatamente o que está sendo feito
- O gasto de recursos computacionais pela a ferramenta
- Necessita de monitoramento constante, pois *Orchestration* não é mágica

> Se não quiser ficar preso a solução da AWS, o ECS, e pensa em mudar de para outro serviço em nuvem. Existe AWS EKS para *Kubernetes* em nuvem

Para essa demonstração utilizarei definições da solução AWS ECS, outros serviços e tecnologias podem utilizar outros nomes, mas o conceito é o mesmo.

#### Cluster

Cluster é um grupo de *tasks* e *services* que utiliza de recursos (nesse caso da AWS) para executar *Tasks* (container) e *Services* (escalonador de container). Esses recursos incluem: 

- Networking (IPv4, IPv6, Subnets)
- CPU, Memória RAM e *Storage*
- Sistema operacional

Na *AWS* esses recursos são *Virtual Private Cloud*, ou *VPC*, para *Networking*, *EC2 instances* (são Máquinas virtual) para CPU, memória, *Storage* e sistema operacional. Além de serviços da própria AWS, como *AWS Fargate* para *serverless*, *Availability Zones* para disponibilidade do seu serviço em diferentes localidades, etc.
#### Task

Task é uma instância da aplicação, nesse caso, cada *Task* está rodando uma instância do container baseado em uma *Task Definition* (vai ser explicado o que é). A *Task* faz parte um *Cluster*.
#### Task Definition

Task Definition é como a relação de uma imagem *Docker* para um container *Docker*. Uma imagem *Docker* é uma receita para a construção de um container. Uma *task definition* é uma receita para a construção de *tasks* que é responsável para definir:

- A quantidade de *vCPU* (CPU virtuais) e *Memory* (Memória RAM)
- A Imagem Docker que será utiliza
- Configuração de portas do container
- Definição de variáveis de ambiente
- Sistema operacional a ser utilizado
#### Service
 
Service é responsável por monitorar as *tasks* que estão rodando, e se caso uma delas falharem, ele vai substituí-la com uma nova *task* automaticamente. Uma *Service* pode conter inúmeras instâncias de *task* de uma *task definition*. E caso seja necessário mais *tasks* rodando, é o *service* que irá criar novas *tasks*.

### Código da aplicação Spring Boot

O código a seguir é um *Dockerfile* para um app em *Spring Boot* que uma rota em /host-name para retornar o nome do host.

```dockerfile
FROM eclipse-temurin:17-jdk-alpine AS build

WORKDIR /app

COPY gradle gradle

COPY build.gradle settings.gradle gradlew ./

COPY src src

RUN ./gradlew build -x test

RUN mkdir -p build/libs/dependency && (cd build/libs/dependency; jar -xf ../*-SNAPSHOT.jar)

FROM eclipse-temurin:17-jdk-alpine 
VOLUME /tmp

ARG DEPENDENCY=/app/build/libs/dependency

COPY --from=build ${DEPENDENCY}/BOOT-INF/lib /app/lib
COPY --from=build ${DEPENDENCY}/META-INF /app/META-INF
COPY --from=build ${DEPENDENCY}/BOOT-INF/classes /app

EXPOSE 8000

ENTRYPOINT ["java","-cp","app:app/lib/*", "com.javaappforecs.JavaAppForEcsApplication"]
```

> Esse *Dockerfile* está disponível no [*DockerHub*](https://hub.docker.com/r/matheusinit/java-app-for-ecs)

Nesse exemplo que utilizei, o seguinte foi usado:
- O *cluster* ECS para executar algumas instâncias do app
- Um *Load Balancer* para distribuir a carga entre essas instâncias
- Alguns recursos da AWS como *NAT Gateway*, *VPC*, *Security Group*, *Listeners*, ...

### Na prática com AWS ECS

#### Criando a rede privada e pública

A primeira coisa que vamos fazer é criar uma *VPC* que é rede privada em nuvem e assim posso isolar os serviços de outros serviços que tenho. Criarei uma *VPC* nova somente para os serviços desse exemplo, e será chamado de JavaApp-vpc (o nome não importa).

Para criar o VPC: 
 - Vá até o dashboard de *VPC* na *AWS* em [https://console.aws.amazon.com/vpc/](https://console.aws.amazon.com/vpc/).
 - Clique em **Create VPC**
 - Tenha certeza que **VPC and more** está selecionado, e dê um nome para o VPC em **Name tag auto-generation**. (não é necessário adicionar **-vpc** no final pois é feito automaticamente)
 - Pode deixar o resto como padrão e clicar em **Create VPC**

Como resultado teremos o *VPC* criado com *Subnets* que são rede internas ao *VPC* com 2 rotas públicas e 2 privadas, *Route tables* e *Network connections* para a conexão do *VPC* a internet ou para acesso ao serviço *AWS S3*. Agora nós temos um *VPC* (rede na nuvem) que tem 2 sub-redes públicas para o *Load Balancer* e 2 sub-redes para os serviços internos como *EC2 instances*, *ECS Cluster*, etc.

![VPC Creation](/ecs-cluster-ec2/00-vpc-creation.png)

#### Limitando o acesso dos serviços

Agora é preciso definir o que pode ser acesso para cada serviço. Por exemplo, o *Load Balancer* tem que ter pelo menos aberto a porta 80 para acesso *HTTP*, e as *EC2 instances* precisa permitir a comunicação com o *Load Balancer*.

Para criar o *Security Group* para o *Load Balancer*:
- Vá até o dashboard do *EC2* na *AWS* em [https://console.aws.amazon.com/ec2/](https://console.aws.amazon.com/ec2/)
- Clique em **Security groups** e depois em **Create security group**
- Para **Security group name** (nome do *Security Group*) vou definir como JavaAppLoadBalancerSecurityGroup
- Vou selecionar o **JavaApp-vpc** para o **VPC**
- Agora precisamos definir **Inbound rules**, que são regras para definir quem pode ter acesso ao serviço. Clique em **Add rule**. Nesse caso selecionarei *HTTP* para o **Type** e *Anywhere-IPv4* para **Source**, e se quiser, uma descrição em **Description**
- Agora clique em **Create security group**

Para criar o *Security Group* para o *ECS Cluster*:
- Na página de **Security Groups**, clique em **Create security group**
- Para **Security group name** (nome do *Security Group*) vou definir como JavaAppECSClusterSecurityGroup
- Vou selecionar o **JavaApp-vpc** para o **VPC**
- Agora precisamos definir **Inbound rules**.  Clique em **Add rule**. Selecionarei *All TCP* para o **Type**, *Custom* para **Source** e procurarei por *JavaAppLoadBalancerSecurityGroup* na barra de pesquisa em **Source**
- Agora clique em **Create security group**

Pronto, agora temos os *Security Group* para o *Load Balancer* e *EC2 instances* do *ECS Cluster* que vamos criar
#### Usando NAT Gateway para acesso a sub-rede privada

Precisamos definir dois NAT Gateway (um para cada sub-rede privada) para que o *ECS Cluster* possa ter acesso as *EC2 instances* na sub-rede privada. 

Para criar as *NAT Gateway*:
 - Vá até o dashboard de *VPC* na *AWS* em [https://console.aws.amazon.com/vpc/](https://console.aws.amazon.com/vpc/)
 - Clique em **NAT Gateways** e depois em **Create NAT gateway**
 - Defino o nome SubnetPrivate1NAT para o primeiro e seleciono a *JavaApp-subnet-public-1* (uma das sub-redes públicas do *VPC* criado) para **Subnet**, garanto que *Public* esteja definido para **Connectivity type** e clico em **Allocate Elastic IP** para alocar um *IP público* para o *NAT Gateway*
 - Agora clico em **Create NAT gateway**
 - Repito o mesmo processo para o segundo, garanta que o nome seja diferente e que a **Subnet** escolhida seja *JavaApp-subnet-public-2*(A *subnet* tem que ser pública e tem que ser diferente da primeira)

Agora é preciso conectar essas *NAT Gateway* nas outras duas *subnet* privadas:
 - Vá em Subnets através do dashboard VPC em [https://console.aws.amazon.com/vpc/](https://console.aws.amazon.com/vpc/)
 - Selecione a subnet JavaApp-subnet-private1, vá na aba **Route table** e clique no *ID* do *Route table*
 - Selecione o único *route table* que estará filtrado, e vá em **Routes**. Clique em **Edit routes** e depois em **Add route**
 - Para **Destination** selecione *0.0.0.0/0* (significa que qualquer IPv4 pode acessar), e em **Target** selecione *NAT Gateway* e escolha o *NAT* criado para a *subnet* privada 1
- Clique em **Save changes**
- Repita o processo para a segunda sub-rede privada, JavaApp-subnet-private2

NAT gateway definidas para a sub-rede privadas, agora qualquer *EC2* instances nessas sub-rede privada pode ser acessada por outros serviços *AWS*

#### Criando o cluster

Agora vamos criar a parte central da aplicação, que é o *Cluster*. O *ECS Cluster* tem três modos de se operar:
 - Com instâncias *EC2*, em que será criado N instâncias de *EC2* para rodar *Docker containers*
 - Com *Serverless*, um modo de rodar em que não precisa se preocupar tanto com infraestrutura
 - Com máquinas virtuais externas, como uma que existe na empresa que você trabalha

A escolhida para esse exemplo, é a mais difícil dentre *Serverless* e *EC2*, a com instâncias de *EC2*. Por ser a com menos conteúdo na internet e ser a opção em que dar mais liberdade para a empresa, em que se pode ter total controle das máquinas que estão rodando.

Para criar o *cluster*:
  - Vá para a página de *clusters* em console.aws.amazon.com/ecs/v2/clusters
  - Clique em **Create cluster**
  - Irei definir o nome JavaAppCluster em **Cluster name**
  - Desmarcarei o *checkbox* com **AWS Fargate (serverless)** e marcarei **Amazon EC2 instances**
  - Agora é preciso definir configurações para *Auto Scaling Group*, uma configuração para escalonar as instâncias EC2.
  - Selecionarei *Amazon Linux 2* para **Operating system/Architecture**, *t2.micro* para **EC2 instance type** (é *free-tier*), definirei o tamanho minimo como 1 e máximo 5 para **Desired capacity** e selecionarei uma chave SSH (se não tiver crie uma em **Create a new key pair**)
  - Vamos para **Network settings for Amazon EC2 instances**. Selecione o *VPC* criado anteriormente em **VPC**, escolha somente *subnets* privadas em **Subnets**, selecione o *Security Group* para *ECS Cluster* em *Security group name*
  - Deixe o resto como padrão, clique em **Create**

#### Criação do Load Balancer

Nossas instâncias EC2 estão em *subnet* privada, o que quer dizer que não pode ser acesso pela a internet. Isso torna as máquinas virtuais mais seguras a ataques externos da rede AWS. Então para acessar o nosso serviços nas instâncias *EC2* (o cluster, na verdade), vamos o *Load Balancer*. O *Load Balancer* vai servir tanto para expor nosso serviço de maneira mais segura já que temos uma camada a mais que é o próprio *Load Balancer* e para distrubuir a carga das instâncias EC2 do *Auto Scaling Group* (vou explicar em breve o que é).

Para criar o *Load Balancer*: 
  - Vá até o dashboard do *EC2* na *AWS* em [https://console.aws.amazon.com/ec2/](https://console.aws.amazon.com/ec2/)
  - Clique em **Load balancers** e depois em **Create load balancer**.
  - Escolha **Application Load Balancer**, que é um que usa HTTP e HTTPS
  - Vou escolher JavaAppLoadBalancer em **Load balancer name**, vou escolher o *JavaApp-vpc* para **VPC**, marcarei todas as regiões disponíveis da *AWS* (*us-east-1a*, *us-east-1b*, ...) e escolherei as *subnets* públicas, já que quero que seja acesso pela a internet
  - Para o **Security groups** escolho o *Security Group* criado anteriormente, *LoadBalancerSecurityGroup*
  - Em **Listeners and Routing** defino *HTTP* para o **Protocol**, *80* para a **Port**.
  - Em **Default action** há **Create target group**, nessa parte definiremos para quais instâncias de EC2 desejamos balancear a carga.
  - Clique em **Create target group**, garanta que **Instances** está selecionado para **Choose a target type**, defina o nome JavaAppTargetGroup em **Target group name** e o *VPC* criado para esse exemplo, *JavaApp-vpc*
  - Clique em **Next**, escolha todas as instâncias de *EC2* que faz parte do *ECS Cluster* (no momento 1) e clique em **Include as pending below**
  - Agora clique em **Create target Group**
  - Volte para a tela de criação do *Load Balancer*, então escolha o *Target Group* JavaAppTargetGroup em **Default action**.
  - Clique em **Create Load Balancer**

#### Auto Scaling Group

*Auto Scaling Group* é um serviço da *AWS* em que dependendo de regras definidas será criadas e destruídas instâncias de *EC2*. Ao criar o *ECS Cluster* foi necessário criar um *Auto Scaling Group*, pois estamos usando *EC2* para o *cluster* invés da opção com *serverless*.

Mas precisamos definir o recém-criado *Target Group* no *Auto Scaling Group* para toda vez que for criado uma nova instância *EC2*, o *Load Balancer* possa reconhecer e contar com ele para balancear a carga.

Para adicionar o *Target Group* no *ECS Cluster*:
  - Vá até o dashboard do *EC2* na *AWS* em [https://console.aws.amazon.com/ec2/](https://console.aws.amazon.com/ec2/)
  - Clique em **Auto Scaling Groups**, selecione o do *ECS Cluster criado* (vai ter o nome do *ECS Cluster* nele)
  - Em **Load balancing**, clique em **Edit**, marque a opção **Application, Network or Gateway Load Balancer target groups** e selecione o *Target Group*
  - Clique em **Update**

Na página do *Auto Scaling Group* criado, podemos adicionar uma regra de *Scaling* (para iniciar novas instâncias):
  - Em **Automatic scaling**, clique em **Create dynamic scaling policy**
  - Garanta que **Target tracking scaling** esteja selecionado, dê um nome em **Scaling policy name** e então selecionarei **Application Load Balancer request count per target**
  - Selecione o *Target Group* criado anteriormente
  - Em **Target value**, selecionamos a quantidade de *requests* que queremos que cada instância de *EC2* lide. Caso o número fique maior que o definido, novas instâncias será criadas. Definirei como 50.
  - Clique em **Create**

Agora toda nova instância *EC2* no *cluster* vai ser usada pelo *Load Balancer*
#### Criando a task definition

Para a *task definition* eu preparei um *JSON* pronto para a criação.

Para criar a *task definition*:
  - Vá em console.aws.amazon.com/ecs/v2/task-definitions e clique em **Create new task definition with JSON**
  - Insira o *JSON* abaixo e clique em **Create**

```json
{
    "containerDefinitions": [
        {
            "name": "java-app",
            "image": "matheusinit/java-app-for-ecs",
            "cpu": 0,
            "memory": 870,
            "memoryReservation": 133,
            "portMappings": [
                {
                    "name": "java-app-8000-tcp",
                    "containerPort": 8000,
                    "hostPort": 80,
                    "protocol": "tcp",
                    "appProtocol": "http"
                }
            ],
            "essential": true,
            "environment": [],
            "environmentFiles": [],
            "mountPoints": [],
            "volumesFrom": [],
            "ulimits": []
        }
    ],
    "family": "JavaApp",
    "taskRoleArn": "arn:aws:iam::457679403018:role/ecsTaskExecutionRole",
    "executionRoleArn": "arn:aws:iam::457679403018:role/ecsTaskExecutionRole",
    "networkMode": "bridge",
    "volumes": [],
    "placementConstraints": [],
    "requiresCompatibilities": [
        "EC2"
    ],
    "cpu": "1024",
    "memory": "870",
    "runtimePlatform": {
        "cpuArchitecture": "X86_64",
        "operatingSystemFamily": "LINUX"
    },
    "tags": []
}
```

#### Executando um Service

Agora podemos criar uma *Service* para executar *tasks*:
  - Vá em console.aws.amazon.com/ecs/v2/clusters e selecione o recém criado *cluster*
  - Em **Services**, clique em **Create**.
  - Com **Capacity provider strategy** e **Use cluster default** selecionado
  - Selecionamos *JavaApp* para **Family** e escolho JavaAppService para **Service**. Garanto que **Replica** está definida
  - Para **Desired tasks** deixarei como 1, por agora
  - Em **Load Balancing - optional**, vamos selecionar o *Load Balancer criado*
  - Em **Load Balancer type**, selecionamos *Application Load Balancer*, selecionamos o *Load Balancer* criado, JavaAppLoadBalancer
  - Em **Container**, marcamos **Use an existing target group** and **Use an existing listener**, e então selecionamos o *Target Group* JavaAppTargetGroup
  - Clique em **Create**

Agora temos o nosso serviço rodando em uma instância de *EC2*

![Load Balancer](/ecs-cluster-ec2/01-spring-app-home.png)

### Testando o *Auto Scaling Group*

Com o comando da ferramenta de *load testing* wrk posso testar se vai ser iniciado novas instâncias de *EC2*.

```zsh title="Terminal"
wrk -t4 -c300 -d60s http://javaapploadbalancer-1023036236.us-east-1.elb.amazonaws.com/host-name
```

> Cuidado que o comando vai

- -t4 para 4 *threads* vão ser usadas para fazer os *requests*
- -c300 para 300 conexões concorrentes
- -d60s para 60 segundos que o teste rodará
- O link com http:// para o *endpoint* da aplicação na *AWS*

> A sua URL vai ser diferente, então use a sua na página de *Load Balancers* na *AWS*

Com o comando novas instâncias vão ser criadas para lidar com os requests feitos:

![Auto Scaling Group](/ecs-cluster-ec2/02-instances-created.png)

As instâncias não vão ser destruídas pois precisa definir o *Scale-out*, o que não me preocupei em fazer nesse exemplo. Mas quando as conexões aumentarem, uma nova instância de *EC2* será criada e também uma *task* nova (que é um *container Docker*).

A partir do momento que as requisições diminuírem, a task será destruída.

> Verifique a quantidade de memória reservada para a *task definition*, dependendo de quanto foi definido uma nova *task* não poderá ser criada no *EC2* por falta de memória. Apesar do *t2.micro* possuir 1G de RAM, não vai ser somente o *container* da aplicação rodando, também há o sistema operacional e um *Docker container* do *ECS Cluster* para gerenciar as *tasks*

### Conclusão

Esse foi o mais difícil até agora. O serviço *ECS* requer conhecimentos abrangentes da *AWS*, como *VPC*, *Target Group*, *Subnets*, etc. O que me fez aprender muito sobre. Demorei mais de 1 semana para fazer isso funcionar, após muitos erros e dificuldades em alcançar o objetivo.

Com isso consegui criar um *Load Balancer* para balancear a carga para um *cluster* de instâncias EC2 que pode escalar dependendo do tráfego de requisições. Isso utilizando tecnologias atuais como **Docker**, **ECS** (solução equivalente a *Kubernetes*), **Cloud** e **Serverless** (foi realizado alguns experimentos com *serverless*).

Alguma observações adquiridas com essa experiência:
  - *Serverless* é prático de usar pois não requer gerenciamento de infraestrutura, máquinas virtuais não.
  - Orquestrador de containers faz sentido para múltiplos serviços com muitas instâncias (*microservices*), quando há somente um serviço acredito que não vale a pena
  - *Networking* é um dos fundamentos mais importantes em infraestrutura, a segurança do serviço em *cloud* depende disso
  - *Cluster* com instâncias *EC2* somente faz sentido quando você precisa manusear e ter controle das máquinas virtuais (motivo esse que desconheço por enquanto), se você não precisa nesse momento, use *serverless*.

O código para a aplicação usada e o *Dockerfile* está no [repositório do GitHub](https://github.com/matheusinit/java-app-for-ecs)

> Fiquem em paz
  
### Links

- [What is container orchestration?](https://cloud.google.com/discover/what-is-container-orchestration#:~:text=Container%20orchestration%20automatically%20provisions%2C%20deploys,life%20cycle%20management%20of%20containers.)
- [The Good and the Bad of Kubernetes Container Orchestration](https://www.altexsoft.com/blog/kubernetes-pros-cons/)
- [Amazon ECS clusters and capacity](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/clusters.html)
- [Amazon ECS task definitions](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definitions.html)
- [Amazon ECS services](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs_services.html)
- [Amazon ECS cluster auto scaling](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/cluster-auto-scaling.html)
- [Amazon ECS on AWS Fargate](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html)

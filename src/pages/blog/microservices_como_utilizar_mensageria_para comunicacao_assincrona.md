---
layout: "../../layouts/blog-post.astro"
title: "(Microservices) Como utilizar mensageria (Message Queue) para comunicacao assíncrona com Apache Kafka"
description: "Introduzir conceitos comunicação assíncrona com mensageria com Apache Kafka"
pubDate: "2023-10-30"
draft: false
---
### Introdução

![Asynchronous](/microservices-kafka/microservices-architecture.png)


Mensageria (*Streaming*) é uma método de comunicação entre serviços em que é utilizado *logs* por meio de eventos. É uma alternativa a comunicação feita com *REST*. Esse tipo de comunicação é utilizado por soluções como **Apache Kafka**, **RabbitMQ** e **Redis Streams**, que vou chamar de `Message Broker`. Essa comunicação é um método utilizado na arquitetura de microsserviços por permitir o desacoplamento entre os microserviços. Isso vai ser explicado mais abaixo.

Para este exemplo utilizarei dois projetos em andamentos, um em Java com Spring Boot e outro com C# em ASP.NET MVC. O motivo de utilizar linguagens diferentes é mostrar que é possível, mas a linguagem não é importante nesse caso.

### Como a comunicação entre serviços funcionam

#### Síncrona

![Request-Reply](/microservices-kafka/comunicação-sincrona.png)

A comunicação síncrona é aquela em que um serviço A faz uma chamada a outro serviço B, mas tem que esperar a resposta do serviço B para dar continuidade, assim ficando bloqueado até que a resposta seja recebida. Isso é chamado de `Synchronous Blocking`.  Para que a chamada síncrona ocorra de forma correta, os dois microsserviços A e B precisam estar rodando. O que tornam um dependente do outro.


#### Assíncrona

![Asynchronous](/microservices-kafka/comunicação-assincrona-com-message-broker.png)

A comunicação assíncrona é o inverso da síncrona. Quando um serviço A faz uma "chamada" para o serviço B ele não fica aguardando a resposta retornar, a aplicação continua. Eventualmente o serviço B vai ser receber a requisição feita pelo o serviço A e processar. Não necessariamente precisa retornar uma resposta, mas se precisar pode ser feito.

Se caso o serviço que precisa receber a chamada não estiver rodando, assim que estiver, ele vai receber todas as chamadas feitas enquanto esteve ausente. E dessa forma os dois serviços se tornam independentes e desacoplados (`Loosely Coupled`).

Nessa arquitetura não feita uma requisição ou chamada, e sim uma mensagem é enviada. Essa mensagem pode conter, por exemplo, um conteúdo JSON.

```json
{
	"id": "d07bde9b-39f3-473c-9b6c-3e91f805e4a6",
	"status": "Not sent",
	"productId": "7be37c94-ad72-48e6-bcb0-babdcc7cf314",
	"createdAt": "2023-10-30T09:35:26.0446169-03:00",
	"updatedAt": null,
	"canceledAt": null
}
```

A solução utilizada foi com `Apache Kafka` como `Message Broker`.

Para saber mais sobre isso recomendo o livro **Building Microservices: Designing Fine-Grained Systems** do **Sam Newman**

### Microservices

> Microsserviços são serviços em que a *release* ocorre independentemente e são modelados a partir do domínio do negócio.

Nesse exemplo terei dois microsserviços que se comunicará de forma assíncrona para fazer um compartilhamento de dados. O microsserviço de pedidos irá compartilhar dados de um pedido feito e eventualmente o microsserviço de entrega irá receber e cadastrar em seu banco de dados.

![Asynchronous](/microservices-kafka/microservices-architecture.png)

### Como Message Broker utiliza Topics

O `Message Broker` vai armazenar as mensagens em uma estrutura de dados chamada `Topic` para então o `Consumer` ou `Subscriber` ler a mensagem. Especialmente no Kafka, as mensagens não são deletadas assim que lidas, elas permanecem armazenadas por X tempo. O *padrão é de 1 semana*, esse aspecto é chamado no Kafka de `Message Retention`.

Um `Topic` pode ser visto como uma `Queue` de estrutura de dados com logs armazenados. Topics podem ser nomeados e podem ter 0, 1 ou muitos `Producer` e `Consumer`.

#### Producer e Consumer

Ou também o `Bounded-Buffer Problem` é um problema descrito por Dijkstra. Esse é um problema que foi resolvido com uma `Queue` em que é descrito que há:
- 2 processos que são chamados de `Producer` e `Consumer`
- `Producer` é um processo cíclico que a cada ciclo produz uma porção de informação
- `Consumer` é um processo cíclico que a cada ciclo consome a próxima porção de informação produzida pelo `Producer`

Um `Message Broker` utilizada dessa arquitetura como solução. No entendo, é utilizado de forma distribuída com `TCP/IP` para permitir essa comunicação a nível de *Virtual Machines* (*VM*).

Essa não é a única arquitetura de comunicação de um *Message Broker*, também há `Pub/Sub`.

#### No código

No código abaixo está um `Consumer` utilizando o framework *Java Spring Boot* (**qualquer linguagem vai utilizar os mesmos conceitos!**) que irá executar uma classe `Service` a partir do conteúdo em JSON recebido. Na annotation `KafkaListener` está definido o nome do Topic, `"ordering"` e um `groupId` para determinar instâncias de aplicação em um determinado grupo, assim permitindo que haja um `Load Balancer` para os `Consumers` e dividir a carga de mensagens entre N instâncias.

```java
package com.deliveryapirest.consumer;

import com.deliveryapirest.data.Order;
import com.deliveryapirest.data.OrderStatus;
import com.deliveryapirest.services.RegisterOrderToShipService;
import com.deliveryapirest.typeAdapters.GsonOptionalAdapter;
import com.deliveryapirest.typeAdapters.GsonZonedDateTimeAdapter;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import java.time.ZonedDateTime;
import java.util.Optional;
import java.util.UUID;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

record OrderToConsume(
    UUID id,
    UUID productId,
    int status,
    ZonedDateTime createdAt,
    Optional<ZonedDateTime> updatedAt,
    Optional<ZonedDateTime> canceledAt) {}

@Component
public class OrderingConsumer {

  RegisterOrderToShipService registerOrderToShipService;

  public OrderingConsumer(RegisterOrderToShipService registerOrderToShipService) {
    this.registerOrderToShipService = registerOrderToShipService;
  }

  @KafkaListener(topics = "ordering", groupId = "orderingGroup")
  public void checkOrder(String content) {
    OrderToConsume orderToConsume = receiveAndSerializeContent(content);

    var order = convertOrderToConsumeToOrderObject(orderToConsume);

    this.registerOrderToShipService.register(order);
  }

  private OrderToConsume receiveAndSerializeContent(String content) {
    Gson gson =
        new GsonBuilder()
            .registerTypeAdapter(ZonedDateTime.class, new GsonZonedDateTimeAdapter())
            .registerTypeAdapterFactory(GsonOptionalAdapter.FACTORY)
            .create();

    var contentInJson = gson.fromJson(content, OrderToConsume.class);

    return contentInJson;
  }

  private Order convertOrderToConsumeToOrderObject(OrderToConsume orderToConsume) {
    OrderStatus orderStatusInEnum = OrderStatus.fromInt(orderToConsume.status());

    var order =
        new Order(
            orderToConsume.id(),
            orderToConsume.productId(),
            1,
            orderStatusInEnum,
            orderToConsume.createdAt(),
            orderToConsume.updatedAt(),
            orderToConsume.canceledAt());

    return order;
  }
}
```

O `Producer` o código é mais simples, na classe abaixo inicio uma nova configuração para o Kafka com o `ClientId` para debugging e `BootstrapServers` para definir os servidores do Kafka através de URL. Após isso é transformado em JSON o conteúdo da mensagem e enviado para o `Message Broker`.

```c#
namespace OrderingApi.Producers;

using System.Net;
using System.Text.Json;
using Confluent.Kafka;
using OrderingApi.Config;

public class OrderingKafkaProducer : OrderingProducer
{
    public async Task<bool> SendOrderThroughMessageQueue(string topic, OrderToProduce order)
    {
        var config = new ProducerConfig
        {
            BootstrapServers = Env.KAFKA_URL,
            ClientId = Dns.GetHostName()
        };

        using (var producer = new ProducerBuilder<Null, string>(config).Build())
        {
            var orderInJson = JsonSerializer.Serialize<OrderToProduce>(order);

            var result = await producer.ProduceAsync(
                topic,
                new Message<Null, string> { Value = orderInJson }
            );

            return await Task.FromResult(true);
        }
    }
}
```

### Conclusão

Me surpreendi como `Message Broker` é um conceito de tecnologia que herda de conceitos muito básicos e antigos como `File System`, `Queue`, `Pub/Sub`, `Decoupling` e `Interprocess Communication`. Esse foi um exemplo de um dos casos de uso de um `Message Broker`, mas com isso deu para entender o funcionamento básico e seu caso de uso com `Microservices`.

O projeto em [Spring Boot](https://github.com/matheusinit/delivery-api-springboot) e [ASP.NET MVC](https://github.com/matheusinit/ordering-api-aspnet) pode ser encontrado no meu Github

> Fiquem em paz


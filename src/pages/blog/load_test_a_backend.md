---
layout: "../../layouts/blog-post.astro"
title: "Teste de carga (Load testing) um serviço Back-end"
description: ""
pubDate: "2024-07-11"
draft: true
---

Comecei a estudar mais aprofundamente sobre microserviços e escalabilidade. Com isso, me encarei com a pergunta: **Quando deve um serviço ser escalado?**. Então respondi a mim mesmo, quando o serviço é demandado mais que atualmente (não é a única resposta!). Para entender se um serviços tem mais usuários por segundo, necessitamos de **Monitoramento**. Calma, esse ainda não é a hora para monitoramento! Para esse exercício, vou supor que há um serviço de monitoramento e que a partir dele vimos que a quantidade de usuários subiu. Então o teste de carga deve ser feito, para avaliarmos como deve ser escalado.

### Utilizados
 - Aplicação Web em HTTP (nesse caso, em Ruby on Rails)
 - Gatling


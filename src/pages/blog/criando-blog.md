---
layout: "../../layouts/blog-post.astro"
title: "Criando blog em Astro"
description: "Astro é um dos mais novos frameworks. Se destacando com as Islands e a geração de código estático"
pubDate: "Feb 14 2023"
draft: false
tags: ["Astro", "SSR"]
---


## Um breve resumo sobre astro

[Astro](https://astro.build/) é um novo `framework` com um objetivo bem interessante de construir sites puramente ou com maior parte estático utilizando os frameworks já estabelecidos como [ReactJS](https://reactjs.org/) e
[Vue](https://vuejs.org/) (mas também como frameworks considerados novos). Uma das características que distingue **Astro** é ser agnóstico a framework e possibilitar utilizar mais de um framework no mesmo código.

Abaixo temos um exemplo de código em Astro

```astro:index.astro
---
// Código que rodará em Server-Side (lado do servidor)

console.log(posts)
---

<main>Hello Astro</main>

<!-- Código astro com qualquer outro framework se preferir (React, Vue)  -->
```

## Código do lado do servidor

O código entre `---` rodará no servidor, ou um termo mais conhecido **SSR** (_Server Side Rendering_). Mas como isso seria feito?

O código que estará rodando em serviço de nuvem como AWS, Azure ou um simples servidor configurada com Nginx. Toda vez que o usuário requisitar a página com o URL do site, o servidor irá gerar um arquivo HTML com todo os dados necessários e após isso a página estará disponível para o usuário.

O Astro faz isso de tal forma que retorna o HTML puro, sem Javascript (só se for necessário). Por isso um dos melhores casos para ele ser utilizados são sites estáticos como blogs e documentações.

[Esse blog é feito em Astro. Veja o código como
exemplo](https://github.com/matheusinit/blog)

O Astro possuí outras funcionalidades muito mais interessante. Veja mais na própria documentação do **[Astro](https://docs.astro.build/)**

> Sempre use Typescript

## Referências

<ul>
  <li>
    <a href="https://www.ionos.com/digitalguide/websites/web-development/server-side-and-client-side-scripting-the-differences/">Server side rendering, client side rendering, and static site generation at a glance - Ionos</a>
  </li>

  <li>
    <a href="https://docs.astro.build/en/guides/server-side-rendering/">Server⁠-⁠side Rendering - Astro Blog</a>
  </li>
</ul>

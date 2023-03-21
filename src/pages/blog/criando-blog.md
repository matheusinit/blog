---
layout: "../../layouts/BlogPost.astro"
title: "Criando blog em Astro"
description: "Utilizando o novo framework Astro para criar páginas estáticas para o meu blog"
pubDate: "Feb 14 2023"
draft: true
---

<h2 className="leading-tight font-medium text-3xl">
  Um breve resumo sobre astro
</h2>

[Astro](https://astro.build/) é um novo framework com um objetivo bem interessante de construir sites puramente ou com maior parte estático utilizando os frameworks já estabelecidos como [ReactJS](https://reactjs.org/) e
[Vue](https://vuejs.org/) (mas também como frameworks considerados novos). Uma das características que distingue **Astro** é ser agnóstico a framework e possibilitar utilizar mais de um framework no mesmo código.

<p>Abaixo temos um exemplo de código em Astro</p>

```astro
---
// Código que rodará em Server-Side (lado do servidor)
---

<!-- Código astro com qualquer outro framework se preferir (React, Vue)  -->
```

<h2 className="leading-tight font-medium text-3xl">
  Código do lado do servidor
</h2>

O código entre **---** rodará no servidor, ou um termo mais conhecido **SSR** (_Server Side Rendering_). Mas como isso seria feito?

![Imagem explicando como funciona SSR](https://www.ionos.com/digitalguide/fileadmin/DigitalGuide/Screenshots_2022/Server-side-rendering-diagram.png)

O código que estará rodando em serviço de nuvem como AWS, Azure ou um simples servidor configurada com Nginx. Toda vez que o usuário requisitar a página com o URL do site, o servidor irá gerar um arquivo HTML com todo os dados necessários e após isso a página estará disponível para o usuário.

O Astro faz isso de tal forma que retorna o HTML puro, sem Javascript (só se for necessário). Por isso um dos melhores casos para ele ser utilizados são sites estáticos como blogs e documentações.

<small>
  [Esse blog é feito em Astro. Veja o código como
  exemplo](https://github.com/matheusinit/blog)!
</small>

O Astro possuí outras funcionalidades muito mais interessante. Veja mais na própria documentação do **[Astro](https://docs.astro.build/)**

<h4 className="leading-loose font-medium text-2xl">Referências</h4>

<ul className="list-disc ml-8">
  <li>
    <a className="hover:text-gray-600 dark:hover:text-gray-400" href="https://www.ionos.com/digitalguide/websites/web-development/server-side-and-client-side-scripting-the-differences/">Server side rendering, client side rendering, and static site generation at a glance - Ionos</a>
  </li>

  <li>
    <a className="hover:text-gray-600 dark:hover:text-gray-400" href="https://docs.astro.build/en/guides/server-side-rendering/">Server⁠-⁠side Rendering - Astro Blog</a>
  </li>
</ul>

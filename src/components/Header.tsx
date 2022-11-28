import React from 'react'
import type { FC } from 'react'
import { Link } from './Link'

interface Params {
  activePagePath?: string
}

export const Header: FC<Params> = ({ activePagePath = '/' }) => {
  return (
    <header className="mx-auto flex w-full items-center justify-between py-8 px-5 text-base xl:max-w-screen-xl">
      <a href="/" className="flex items-center gap-x-3">
        <img src="./logo.svg" alt="Logo" className="w-8" />
        <h1 className="hidden text-lg font-medium text-gray-700 hover:text-gray-900 md:block">
          matheusinit
        </h1>
      </a>

      <nav>
        <ul className="flex justify-between gap-x-8 font-medium text-gray-600">
          <Link href="/" active={activePagePath === '/'}>
            Início
          </Link>
          <Link href="/blog" active={activePagePath === '/blog'}>
            Blog
          </Link>
          <Link href="/about" active={activePagePath === '/about'}>
            Sobre
          </Link>
        </ul>
      </nav>

      <div></div>
    </header>
  )
}

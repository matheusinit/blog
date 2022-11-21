import React from 'react'
import type { FC } from 'react'
import { Link } from './Link'

interface Params {
  activePagePath?: string
}

export const Header: FC<Params> = ({ activePagePath = '/' }) => {
  return (
    <header className="flex w-full justify-center py-8 text-base">
      <nav className="w-64">
        <ul className="flex justify-between font-medium text-gray-600">
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
    </header>
  )
}

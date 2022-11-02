import React from 'react'
import type { FC } from 'react'
import { Link } from './Link'

export const Header: FC = () => {
  return (
    <header className="flex w-full justify-center py-8 text-base">
      <nav className="w-64">
        <ul className="flex justify-between font-medium text-gray-600">
          <Link active>Início</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/about">Sobre</Link>
        </ul>
      </nav>
    </header>
  )
}

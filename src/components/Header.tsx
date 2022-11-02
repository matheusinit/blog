import React from 'react'
import type { FC } from 'react'

export const Header: FC = () => {
  return (
    <header className="flex w-full justify-center py-6 text-base font-bold">
      <nav className="w-52">
        <ul className="flex justify-between text-gray-600">
          <li className="cursor-pointer hover:text-gray-900">
            <a href="/">Inicio</a>
          </li>
          <li className="cursor-pointer hover:text-gray-900">
            <a href="/blog">Blog</a>
          </li>
          <li className="cursor-pointer hover:text-gray-900">
            <a href="/about">Sobre</a>
          </li>
        </ul>
      </nav>
    </header>
  )
}

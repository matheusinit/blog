import React, { useEffect, useState } from 'react'
import type { FC } from 'react'
import { Link } from './Link'
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid'

interface Params {
  activePagePath?: string
}

export const Header: FC<Params> = ({ activePagePath = '/' }) => {
  const [darkMode, setDarkMode] = useState<boolean>(false)

  useEffect(() => {
    const isOnDarkMode = document.documentElement.classList.contains('dark')

    setDarkMode(isOnDarkMode)
  }, [])

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

      <div>
        {!darkMode && (
          <MoonIcon
            className="h-6 w-6 cursor-pointer text-gray-600 hover:animate-bounce hover:text-gray-800"
            onClick={() => {
              if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark')
              } else {
                document.documentElement.classList.add('dark')
              }

              setDarkMode((previous) => !previous)
            }}
          />
        )}

        {darkMode && (
          <SunIcon
            className="h-6 w-6 cursor-pointer text-gray-600 hover:text-gray-800"
            onClick={() => {
              if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark')
              } else {
                document.documentElement.classList.add('dark')
              }

              setDarkMode((previous) => !previous)
            }}
          />
        )}
      </div>
    </header>
  )
}

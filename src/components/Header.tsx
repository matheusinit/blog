import React, { useEffect, useState } from 'react'
import type { FC } from 'react'
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid/index'

export const Header: FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false)

  useEffect(() => {
    const isOnDarkMode =
      document.documentElement.classList.contains('dark') ||
      localStorage.getItem('app-theme') === 'dark'

    if (isOnDarkMode) {
      document.documentElement.classList.add('dark')
    }

    setDarkMode(isOnDarkMode)
  }, [])

  return (
    <header className="mx-auto mt-8 flex w-full items-center justify-between text-base">
      <a href="/" className="hidden items-center gap-x-3 md:flex">
        <h1 className="hidden text-xl font-semibold dark:text-gray-200 dark:hover:text-gray-50 md:block">
          matheusinit
        </h1>
      </a>

      <div className="flex w-full justify-center md:w-auto">
        {!darkMode && (
          <MoonIcon
            className="h-6 w-6 cursor-pointer text-gray-500 hover:text-gray-800  dark:text-gray-300 dark:hover:text-white"
            onClick={() => {
              if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark')
              } else {
                document.documentElement.classList.add('dark')
              }

              localStorage.setItem('app-theme', 'dark')

              setDarkMode((previous) => !previous)
            }}
          />
        )}

        {darkMode && (
          <SunIcon
            className="h-6 w-6 cursor-pointer text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
            onClick={() => {
              if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark')
              } else {
                document.documentElement.classList.add('dark')
              }

              localStorage.setItem('app-theme', 'light')

              setDarkMode((previous) => !previous)
            }}
          />
        )}
      </div>
    </header>
  )
}

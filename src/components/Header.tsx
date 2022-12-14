import React, { useEffect, useState } from 'react'
import type { FC } from 'react'
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid'

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
    <header className="mx-auto flex w-full items-center justify-between p-8 text-base xl:max-w-screen-xl xl:px-0">
      <a href="/" className="flex items-center gap-x-3">
        <img src="/logo.svg" alt="Logo" className="w-8" />
        <h1 className="hidden text-lg font-medium text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-gray-50 md:block">
          matheusinit
        </h1>
      </a>

      <div>
        {!darkMode && (
          <MoonIcon
            className="h-6 w-6 cursor-pointer text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
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

import React, { useEffect, useState } from 'react'
import type { FC } from 'react'
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid/index'

type AppTheme = 'dark' | 'light'

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

  const toggleThemeTo = (theme: AppTheme) => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
    }

    localStorage.setItem('app-theme', theme)

    setDarkMode((previous) => !previous)
  }

  return (
    <header className="mx-auto mt-8 flex w-full items-center justify-between text-base">
      <a href="/" className="hidden items-center gap-x-3 md:flex">
        <h1 className="hidden text-xl font-semibold dark:text-gray-200 dark:hover:text-gray-50 md:block">
          matheusinit
        </h1>
      </a>

      <button className="flex w-full justify-center rounded-lg bg-app-gray-darker/40 px-3 py-2 hover:bg-app-gray-darker/70 dark:bg-app-violet-base/70 dark:hover:bg-app-violet-base md:w-auto">
        {!darkMode && (
          <MoonIcon
            className="h-6 w-6 cursor-pointer text-gray-500  dark:text-gray-300"
            onClick={() => toggleThemeTo('dark')}
          />
        )}

        {darkMode && (
          <SunIcon
            className="h-6 w-6 cursor-pointer text-gray-500 dark:text-gray-300"
            onClick={() => toggleThemeTo('light')}
          />
        )}
      </button>
    </header>
  )
}

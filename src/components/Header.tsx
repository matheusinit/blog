import React from 'react'
import type { FC } from 'react'
import { IconBrandGithub } from '@tabler/icons'

export const Header: FC = () => {
  return (
    <header className="mx-auto mt-8 flex w-full items-center justify-between text-base">
      <a href="/" className="">
        Início
      </a>

      <div className="flex w-auto items-center justify-end gap-x-4">
        <a role="button" href="https://github.com/matheusinit/blog" className="flex items-center gap-x-2 rounded-lg bg-app-gray-darker/40 p-3 text-sm hover:bg-app-gray-darker/70 dark:bg-app-violet-light dark:hover:bg-app-violet-base" target="_blank" rel="noreferrer" >
          <IconBrandGithub className="size-5" />
          <div className="font-bold">View on Github</div>
        </a>
      </div>

    </header>
  )
}

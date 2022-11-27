import React from 'react'
import { IconBrandGithub, IconBrandLinkedin } from '@tabler/icons'

export const Footer = () => {
  return (
    <div className="mt-12 flex items-center justify-between border-t border-gray-400 pt-8 font-['Poppins'] text-gray-800">
      <div className="max-w-[20rem] font-mono text-sm font-semibold lg:max-w-full lg:text-base">
        Todas postagens e sistema feito por{' '}
        <a
          href="/"
          className="text-blue-600 decoration-red-600 decoration-wavy hover:underline"
        >
          Matheus Oliveira (me)
        </a>
      </div>

      <div className="flex gap-x-2">
        <a href="/">
          <IconBrandGithub className="h-8 w-8 hover:rotate-12 hover:text-gray-600" />
        </a>
        <a href="/">
          <IconBrandLinkedin className="h-8 w-8 hover:rotate-12 hover:text-gray-600" />
        </a>
      </div>
    </div>
  )
}

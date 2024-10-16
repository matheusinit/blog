import { type FC } from 'react'

import { ClipboardIcon } from '@heroicons/react/24/outline'

import { toast } from 'react-hot-toast'

export const EmailContent: FC = () => {
  const EMAIL = "matheus.oliveira.s@protonmail.com"

  return (
    <div className="flex space-x-2 items-center bg-[#F3F4F6] px-3 py-1 rounded-md">
      <input
        disabled
        value={EMAIL}
        className="w-60 text-sm disabled:font-medium disabled:text-secondary-foreground bg-transparent"
      />

      <div className="p-1 rounded">
        <ClipboardIcon
          className="size-4 text-secondary-foreground cursor-pointer"
          onClick={() => {
            navigator.clipboard.writeText(EMAIL)

            toast('Email copiado!')
          }}
        />
      </div>
    </div>
  )
}

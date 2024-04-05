import React from 'react'
import type { FC } from 'react'
import reactUuid from 'react-uuid'
import { format } from 'date-fns'

import ptBrPkg from 'date-fns/locale/pt-BR/index'

const { ptBR } = ptBrPkg

interface Params
  extends React.DetailedHTMLProps<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  HTMLAnchorElement
  > {
  title: string
  description?: string
  tags?: string[]
  isNew?: boolean
  createdAt?: string
}

const defaultCreatedAt = format(new Date(), 'PP', { locale: ptBR })

const onClickWrapper = (
  event:
  | React.MouseEvent<HTMLDivElement, MouseEvent>
  | React.KeyboardEvent<HTMLDivElement>,
  tag: string
) => {
  event.preventDefault()

  navigateTagPage(tag)
}

const navigateTagPage = (tag: string) => {
  const cleanUrlResource = tag.toLowerCase().replaceAll(' ', '-')

  const url = new URL(`/tags/${cleanUrlResource}`, location.origin)

  window.open(url, '_self')
}

const onKeyDownWrapper = (
  event: React.KeyboardEvent<HTMLDivElement>,
  tag: string
) => {
  if (event.key === 'Enter') {
    navigateTagPage(tag)
  }
}

export const BlogCard: FC<Params> = ({
  title,
  description,
  tags = [],
  isNew = false,
  createdAt = defaultCreatedAt,
  ...rest
}) => {
  return (
    <a
      {...rest}
      className="relative flex w-[22rem] flex-col justify-between rounded-md border border-gray-200 bg-gray-50 px-4 pb-4 pt-2 text-slate-600 shadow-md hover:text-slate-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-gray-200  md:min-h-48 md:w-96"
    >
      <div className="flex flex-col pb-8">
        <div className="max-h-16 text-xl font-medium">{title}</div>

        {description != null && (
          <p className="line-clamp-2 text-base font-normal text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}

        <div className="font-light text-slate-400 dark:text-gray-500">
          {createdAt}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-2">
        {tags.map((tag) => (
          <div
            className="inline-flex h-8 cursor-pointer items-center justify-center rounded-2xl bg-blue-400 px-3 text-sm text-white hover:bg-blue-600 dark:border dark:border-gray-600 dark:bg-slate-600 dark:hover:border-gray-500"
            key={reactUuid()}
            onClick={(event) => onClickWrapper(event, tag)}
            onKeyDown={(event) => onKeyDownWrapper(event, tag)}
            role="button"
            tabIndex={0}
          >
            {tag}
          </div>
        ))}
      </div>

      {isNew && (
        <div className="absolute bottom-4 right-3.5 rounded bg-green-600 px-2 py-0.5 text-sm font-medium text-white">
          Novo
        </div>
      )}
    </a>
  )
}

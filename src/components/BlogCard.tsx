import React from 'react'
import type { FC } from 'react'
import reactUuid from 'react-uuid'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Params
  extends React.DetailedHTMLProps<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  HTMLAnchorElement
  > {
  title: string
  description?: string
  tags?: string[]
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
  createdAt = defaultCreatedAt,
  ...rest
}) => {
  return (
    <a
      {...rest}
      className="flex w-[22rem] flex-col justify-between rounded border border-gray-200 px-4 pt-2 pb-4 text-slate-600 shadow-md hover:text-slate-800  md:min-h-[12rem] md:w-96"
    >
      <div className="flex flex-col pb-8">
        <div className="max-h-[4rem] text-xl font-medium">{title}</div>

        {description != null && (
          <p className="line-clamp-2 text-base font-normal text-slate-500">
            {description}
          </p>
        )}

        <div className="font-light text-slate-400">{createdAt}</div>
      </div>

      <div className="flex flex-wrap gap-x-2">
        {tags.map((tag) => (
          <div
            className="inline-flex h-8 cursor-pointer items-center justify-center rounded-2xl bg-blue-400 px-3 text-sm text-white hover:text-gray-900"
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
    </a>
  )
}

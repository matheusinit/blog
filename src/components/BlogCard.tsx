import React from 'react'
import type { FC } from 'react'
import reactUuid from 'react-uuid'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Params extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  title: string
  tags?: string[]
  createdAt?: string
}

const defaultCreatedAt = format(new Date(), 'PP', { locale: ptBR })

export const BlogCard: FC<Params> = ({
  title,
  tags = [],
  createdAt = defaultCreatedAt,
  ...rest
}) => {
  return (
    <div {...rest} className="flex max-h-40 w-[22rem] flex-col rounded border border-gray-200 px-2 pt-2 pb-4 text-slate-600 shadow-md hover:text-slate-800  md:max-h-48 md:w-96" >
      <div className="flex flex-col pb-8">
        <div className="max-h-[4rem] text-xl font-medium">{title}</div>
        <div className="font-light text-slate-500">{createdAt}</div>
      </div>

      <div className="flex grow flex-wrap gap-x-2">
        {tags.map((tag) => (
          <div
            className="inline-flex h-8 items-center justify-center rounded-2xl bg-blue-400 px-3 text-sm text-white hover:text-gray-900"
            key={reactUuid()}
          >
            {tag}
          </div>
        ))}
      </div>
    </div>
  )
}

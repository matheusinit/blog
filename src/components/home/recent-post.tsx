import { format, addDays } from 'date-fns/esm'
import ptBR from 'date-fns/locale/pt-BR'
import type { FC } from 'react'
import React from 'react'

interface RecentPostProps {
  href: string
  title: string
  pubDate: string
}

const RecentPost: FC<RecentPostProps> = ({ href, title, pubDate }) => {
  return (
    <li>
      <a href={href} className="flex justify-between">
        <div className="underline underline-offset-4">{title}</div>
        <div>{format(addDays(new Date(pubDate), 1), 'PP', { locale: ptBR })}</div>
      </a>
    </li>
  )
}

export default RecentPost

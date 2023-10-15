import { format } from 'date-fns/esm'
import ptBR from 'date-fns/locale/pt-BR'
import type { FC } from 'react'
import React from 'react'
import uuid from 'react-uuid'
import type { BlogPost } from '../../types'

interface RecentPostProps {
  posts: BlogPost[]
}

const RecentPost: FC<RecentPostProps> = ({ posts }) => {
  return (
    <ul className="flex flex-col space-y-4">
      {posts.map(p => (
        <li key={uuid()}>
          <a href={p.url} className="flex justify-between">
            <div className="underline underline-offset-4">{p.frontmatter.title}</div>
            <div>{format(new Date(p.frontmatter.pubDate.replaceAll('-', '/')), 'PP', { locale: ptBR })}</div>
          </a>
        </li>
      ))}

      <li>
        <a href="/blog" className="underline underline-offset-4">Ver todos</a>
      </li>
    </ul>
  )
}

export default RecentPost

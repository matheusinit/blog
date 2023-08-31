import React from 'react'
import type { FC } from 'react'

interface Props {
  title: string
  description: string
  createdAt: string
  readTime: string
  key: string
  href?: string
}

export const BlogPostCard: FC<Props> = ({ title, description, createdAt, readTime, href }) => {
  return (
    <a href={href} className="flex flex-col rounded-lg border border-gray-300 bg-app-gray-darker/10 p-3 transition-colors hover:bg-app-gray-dark dark:border-app-violet-base dark:bg-app-violet-dark/95 dark:hover:border-app-violet-base dark:hover:bg-app-violet-base">
      <h3 className="mb-3 text-xl font-bold text-app-red-light dark:text-app-red-base">{title}</h3>

      <p className="mb-2 font-medium">{description}</p>

      <div className="flex items-center gap-x-1">
        <span className="text-sm font-light">{createdAt}</span>
        <span className="text-gray-500">•</span>
        <span className="text-sm font-light">{readTime}</span>
      </div>
    </a>
  )
}

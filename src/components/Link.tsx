import React from 'react'
import type { FC } from 'react'

interface Props {
  children: string
  href?: string
  active?: boolean
}

export const Link: FC<Props> = ({ href = '/', children, active = false }) => {
  const classes = 'cursor-pointer rounded py-1 px-4 text-white transition-colors'

  const bgClasses = active ? 'bg-blue-600' : 'bg-blue-400 hover:bg-blue-600'

  return (
    <li className={`${classes} ${bgClasses}`}>
      <a href={href}>{children}</a>
    </li>
  )
}

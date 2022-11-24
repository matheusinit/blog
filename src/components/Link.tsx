import React from 'react'
import type { FC } from 'react'

interface Props {
  children: string
  href?: string
  active?: boolean
}

export const Link: FC<Props> = ({ href = '/', children, active = false }) => {
  const classes = 'cursor-pointer transition-colors'

  const bgClasses = active
    ? 'text-slate-900'
    : 'text-gray-500 hover:text-slate-900'

  return (
    <li className={`${classes} ${bgClasses}`}>
      <a href={href}>{children}</a>
    </li>
  )
}

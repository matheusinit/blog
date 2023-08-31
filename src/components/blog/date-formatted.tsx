import type { FC } from 'react'
import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR/index'

import React from 'react'

interface Props {
  pubDate: string
}

const DateFormatted: FC<Props> = ({ pubDate }) => {
  return (
    <div>{format(new Date(pubDate), 'PP', { locale: ptBR })}</div>
  )
}

export default DateFormatted

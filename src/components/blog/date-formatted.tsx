import type { FC } from 'react'
import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR/index'

import React from 'react'

interface Props {
  pubDate: string
}

const DateFormatted: FC<Props> = ({ pubDate }) => {
  const dateSplitted = pubDate.split('-')
  const year = Number(dateSplitted[0])
  const month = Number(dateSplitted[1])
  const day = Number(dateSplitted[2])

  return (
    <div>{format(new Date(year, month, day), 'PP', { locale: ptBR })}</div>
  )
}

export default DateFormatted

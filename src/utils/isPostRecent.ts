import { isAfter, subDays } from 'date-fns'

export const isPostRecent = (pubDate: string) => {
  const threeDaysAgo = subDays(new Date(), 3)
  return isAfter(new Date(pubDate), threeDaysAgo)
}

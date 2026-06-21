import dayjs from 'dayjs'

export function dateFormat(date: number | string, formatter = 'YYYY-MM-DD HH:mm:ss'): string {
  return dayjs(date).format(formatter)
}

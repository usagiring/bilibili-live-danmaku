import dayjs from 'dayjs'
import { ANCHOR_ICON_MAP, PRICE_PROPERTIES } from './const'
import { Message } from '../types'

export function dateFormat(date: number | string | Date, formatter = 'YYYY-MM-DD HH:mm:ss') {
  return dayjs(date).format(formatter)
}

export function getPriceProperties(price: number) {
  if (price < 50) {
    return PRICE_PROPERTIES[0]
  }
  if (price >= 50 && price < 100) {
    return PRICE_PROPERTIES[1]
  }
  if (price >= 100 && price < 500) {
    return PRICE_PROPERTIES[2]
  }
  if (price >= 500 && price < 1000) {
    return PRICE_PROPERTIES[3]
  }
  if (price >= 1000 && price < 2000) {
    return PRICE_PROPERTIES[4]
  }
  if (price >= 2000) {
    return PRICE_PROPERTIES[5]
  }
}

export async function wait(ms = 1000) {
  await new Promise(resolve => setTimeout(resolve, ms))
}

export function getAnchorIcon(msg: Message): string | undefined {
  for (const role of msg.roles || []) {
    if (ANCHOR_ICON_MAP[role]) return ANCHOR_ICON_MAP[role]
  }
}

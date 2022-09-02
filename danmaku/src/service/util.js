import moment from 'moment'
import { PRICE_PROPERTIES } from './const'

export function dateFormat(date, formatter = "YYYY-MM-DD HH:mm:ss") {
  return moment(date).format(formatter);
}

export function getPriceProperties(price) {
  if (price < 50) {
    return PRICE_PROPERTIES["1"];
  }
  if (price >= 50 && price < 100) {
    return PRICE_PROPERTIES["2"];
  }
  if (price >= 100 && price < 500) {
    return PRICE_PROPERTIES["3"];
  }
  if (price >= 500 && price < 1000) {
    return PRICE_PROPERTIES["4"];
  }
  if (price >= 1000 && price < 2000) {
    return PRICE_PROPERTIES["5"];
  }
  if (price >= 2000) {
    return PRICE_PROPERTIES["6"];
  }
}

export async function wait(ms = 1000) {
  await new Promise(resolve => setTimeout(resolve, ms))
}
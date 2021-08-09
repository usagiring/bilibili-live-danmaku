import moment from "moment";
import { PRICE_PROPERTIES, GUARD_ICON_MAP, INTERACT_TYPE } from './const'
import { getGiftConfig as getGiftConfigAPI } from './api'

// TODO 设置一些更小的粒度？ < 1
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

export function getGuardIcon(level) {
  return GUARD_ICON_MAP[level]
}

export function getInteractType(type) {
  return INTERACT_TYPE[type]
}

const units = ['B/s', 'KB/s', 'MB/s']
export function parseDownloadRate(value, unitIndex = 0) {
  if (value < 1024) return `${value} ${units[unitIndex]}`
  value = (value / 1024).toFixed(1)
  return parseDownloadRate(value, ++unitIndex)
}

export function parseHexColor(colorNumber) {
  return `#${colorNumber.toString(16).padStart(6, '0')}`
}

export function dateFormat(date, formatter = "YYYY-MM-DD HH:mm:ss") {
  return moment(date).format(formatter);
}

// export function setGiftConfigMap(gifts) {
//   const giftConfigMap = gifts.reduce((map, gift) => {
//     return Object.assign(map, {
//       [gift.id]: {
//         webp: gift.webp,
//         name: gift.name,
//         price: gift.price
//       }
//     })
//   }, {})
//   fs.writeFileSync('gift_config', JSON.stringify(giftConfigMap))
// }

// [{ ... , probability: number }]
export function getRandomItem(items) {
  const total = items.reduce((total, item) => {
    return total + item.probability
  }, 0)
  const factor = Math.random() * total
  let threshold = 0

  for (let i = 0; i < items.length; i++) {
    threshold += items[i].probability
    if (threshold > factor) {
      return items[i]
    }
  }

  return null
}

let __giftConfig
export async function getGiftConfig() {
  if (__giftConfig) return __giftConfig
  const { data: giftConfig } = await getGiftConfigAPI()
  __giftConfig = giftConfig
  return giftConfig
}
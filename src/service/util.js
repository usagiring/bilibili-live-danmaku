import { PRICE_PROPERTIES, GET_USER_INFO_FREQUENCY_LIMIT, GUARD_ICON_MAP, INTERACT_TYPE } from './const'
import { getUserInfo } from './bilibili-api'

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

let isGetUserInfoLocked = false;
let isGetUserInfoLocked20min = false
export async function getUserInfoThrottle(uid) {
  if (isGetUserInfoLocked) throw new Error("isGetUserInfoLocked");
  if (isGetUserInfoLocked20min) {
    setTimeout(() => {
      isGetUserInfoLocked20min = false
    }, 1000 * 60 * 20)
    throw new Error('isGetUserInfoLocked 20min')
  }
  // 限制获取头像频率 避免412被封
  // 412 和请求量和速率都有关系，阶段式限流
  isGetUserInfoLocked = true;
  setTimeout(() => {
    isGetUserInfoLocked = false;
  }, GET_USER_INFO_FREQUENCY_LIMIT);

  try {
    const { data } = await getUserInfo(uid);
    return data;
  } catch (e) {
    if (e.message === 'Request failed with status code 412') {
      isGetUserInfoLocked20min = true
    }
    throw e
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
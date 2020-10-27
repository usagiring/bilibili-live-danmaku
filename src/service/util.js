import { PRICE_PROPERTIES, GET_USER_INFO_FREQUENCY_LIMIT, GUARD_ICON_MAP } from './const'
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
export async function getUserInfoThrottle(uid) {
  if (isGetUserInfoLocked) throw new Error("isGetUserInfoLocked");
  // 限制获取头像频率 避免412被封
  // 412 和请求量和速率都有关系，阶段式限流
  isGetUserInfoLocked = true;
  setTimeout(() => {
    isGetUserInfoLocked = false;
  }, GET_USER_INFO_FREQUENCY_LIMIT);

  const { data } = await getUserInfo(uid);
  return data;
}

export function getGuardIcon(level) {
  return GUARD_ICON_MAP[level]
}
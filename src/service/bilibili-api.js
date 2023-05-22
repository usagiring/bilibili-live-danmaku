import axios from 'axios'
import cookie from "cookie";
import httpAdapter from './http'

const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:9080' : 'https://api.bilibili.com'
const baseLiveUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:9080' : 'https://api.live.bilibili.com'


export {
  getRoomInfoV1,
  getRoomInfoV2,
  getInfoByUser,
  getDamankuInfo,
  getGiftConfig,
  getUserInfo,
  getUserInfoV2,
  getHistoryMessages,
  getGuardInfo,
  getPlayUrl,
  sendMessage,
  wearMedal,
  getBagList,
  sendBagGift,
  getRoomInfoByIds,
  getMedalList,
}

const defaultHeaders = {
  origin: "https://live.bilibili.com",
  referer: "https://live.bilibili.com/",
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-site",
  accept: "application/json, text/javascript, */*; q=0.01",
  "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7",
  "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.104 Safari/537.36",
}

async function getRoomInfoV1() {
  const res = await axios.get(`${baseLiveUrl}/room/v1/Room/get_info?room_id=${roomId}&from=room`)
  return res.data
}

async function getRoomInfoV2(roomId) {
  const res = await axios.get(`${baseLiveUrl}/xlive/web-room/v1/index/getInfoByRoom?room_id=${roomId}`)
  return res.data
}

async function getInfoByUser(roomId, cookie) {
  const res = await axios.get(`https://api.live.bilibili.com/xlive/web-room/v1/index/getInfoByUser?room_id=${roomId}&from=0`, {
    headers: Object.assign({}, defaultHeaders, { cookie }),
    adapter: httpAdapter
  })
  return res.data
}

async function getDamankuInfo(roomId) {
  const res = await axios.get(`${baseLiveUrl}/xlive/web-room/v1/index/getDanmuInfo?id=${roomId}&type=0`)
  return res.data
}

async function getGiftConfig(roomId, platform = 'pc') {
  const res = await axios.get(`${baseLiveUrl}/xlive/web-room/v1/giftPanel/giftConfig?platform=${platform}&room_id=${roomId}`)
  return res.data
}

async function getUserInfo(userId) {
  const res = await axios.get(`${baseUrl}/x/space/acc/info?mid=${userId}&jsonp=jsonp`, {
    timeout: 1000
  })
  return res.data
}

async function getUserInfoV2(userId) {
  const res = await axios.get(`${baseUrl}/x/space/wbi/acc/info?mid=${userId}&platform=web`, {
    timeout: 1000
  })
  return res.data
}

async function getHistoryMessages(roomId) {
  const res = await axios.get(`${baseLiveUrl}/xlive/web-room/v1/dM/gethistory?roomid=${roomId}`, {

  })
  return res.data
}

async function getGuardInfo(roomId, ruid) {
  const res = await axios.get(`${baseLiveUrl}/xlive/app-room/v2/guardTab/topList?roomid=${roomId}&page=1&ruid=${ruid}&page_size=29`, {

  })
  return res.data
}

async function getPlayUrl(roomId) {
  const res = await axios.get(`${baseLiveUrl}/room/v1/Room/playUrl?cid=${roomId}&qn=0&platform=web`)
  return res.data
}

async function sendMessage(data, userCookie) {
  const { message, roomId, color, fontsize, mode, rnd, bubble } = data
  const cookies = cookie.parse(userCookie);
  const csrf = cookies.bili_jct;
  const params = new URLSearchParams({
    color: color || 16777215,
    fontsize: fontsize || 25,
    mode: mode || 1,
    msg: message,
    rnd: rnd || Math.floor(Date.now() / 1000 - 10000),
    roomid: roomId,
    bubble: bubble || 0,
    csrf_token: csrf,
    csrf: csrf,
  }).toString()

  const res = await axios.post(`https://api.live.bilibili.com/msg/send`, params, {
    headers: Object.assign({}, defaultHeaders, { cookie: userCookie }),
    adapter: httpAdapter
  })
  return res
}

async function wearMedal(medalId, userCookie) {
  if (!medalId) throw new Error('medalId is required')
  const cookies = cookie.parse(userCookie);
  const csrf = cookies.bili_jct;
  const params = new URLSearchParams({
    medal_id: medalId,
    csrf_token: csrf,
    csrf: csrf,
  }).toString()

  const res = await axios.post(`https://api.live.bilibili.com/xlive/web-room/v1/fansMedal/wear`, params, {
    headers: Object.assign({}, defaultHeaders, { cookie: userCookie }),
    adapter: httpAdapter
  })
  return res
}

async function getBagList(roomId, userCookie) {
  const res = await axios.get(`https://api.live.bilibili.com/xlive/web-room/v1/gift/bag_list?t=${Date.now()}&room_id=${roomId}`, params, {
    headers: Object.assign({}, defaultHeaders, { cookie: userCookie }),
    adapter: httpAdapter
  })
  return res
}

async function sendBagGift(data, userCookie) {
  const { uid, gift_id, ruid, bag_id, rnd, biz_id, price } = data
  const cookies = cookie.parse(userCookie);
  const csrf = cookies.bili_jct;
  const params = new URLSearchParams({
    uid,
    gift_id,
    ruid,
    send_ruid: 0,
    gift_num: 1,
    bag_id,
    platform: 'pc',
    biz_code: 'live',
    biz_id,
    rnd: rnd || Math.floor(Date.now() / 1000 - 10000),
    storm_beat_id: 0,
    price: price || 0,
    csrf_token: csrf,
    csrf: csrf,
  }).toString()

  const res = await axios.post(`https://api.live.bilibili.com/gift/v2/live/bag_send`, params, {
    headers: Object.assign({}, defaultHeaders, { cookie: userCookie }),
    adapter: httpAdapter
  })
  return res
}

async function getRoomInfoByIds(ids) {
  if (!ids || !ids.length) return { data: [] }
  const res = await axios.get(`https://api.live.bilibili.com/room/v1/Room/get_info_by_id?${ids.map(id => `ids[]=${id}`).join('&')}`, {
    headers: Object.assign({}, defaultHeaders),
    adapter: httpAdapter
  })
  return res.data
}

async function getMedalList(data = {}, userCookie) {
  const { page = 1, pageSize = 10 } = data
  const res = await axios.get(
    `https://api.live.bilibili.com/xlive/app-ucenter/v1/user/GetMyMedals?page=${page}&page_size=${pageSize}`,
    {
      headers: Object.assign({}, defaultHeaders, { cookie: userCookie }),
      adapter: httpAdapter
    }
  )
  return res.data
}
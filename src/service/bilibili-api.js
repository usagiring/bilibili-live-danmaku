const axios = require('axios')
import httpAdapter from './http'

const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:9080' : 'https://api.bilibili.com'
const baseLiveUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:9080' : 'https://api.live.bilibili.com'


export {
  getRoomInfoV1,
  getRoomInfoV2,
  getDamankuInfo,
  getGiftConfig,
  getUserInfo,
  getHistoryMessages,
  getGuardInfo,
  getPlayUrl,
  sendMessage
}

async function getRoomInfoV1() {
  const res = await axios.get(`${baseLiveUrl}/room/v1/Room/get_info?room_id=${roomId}&from=room`)
  return res.data
}

async function getRoomInfoV2(roomId) {
  const res = await axios.get(`${baseLiveUrl}/xlive/web-room/v1/index/getInfoByRoom?room_id=${roomId}`)
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

async function sendMessage(data, cookie) {
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
  const res = await axios.post(`https://api.live.bilibili.com/msg/send`, data, {
    headers: Object.assign({}, defaultHeaders, { cookie }),
    adapter: httpAdapter
  })
  return res
}
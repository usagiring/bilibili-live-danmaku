const axios = require('axios')

const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:9080' : 'https://api.live.bilibili.com'

export {
  getRoomInfo,
  getDamankuInfo,
  getGiftConfig
}

async function getRoomInfo(roomId) {
  const res = await axios.get(`${baseUrl}/xlive/web-room/v1/index/getInfoByRoom?room_id=${roomId}`)
  return res.data
}

async function getDamankuInfo(roomId) {
  const res = await axios.get(`${baseUrl}/xlive/web-room/v1/index/getDanmuInfo?id=${roomId}&type=0`)
  return res.data
}

async function getGiftConfig(roomId, platform = 'pc') {
  const res = await axios.get(`${baseUrl}/xlive/web-room/v1/giftPanel/giftConfig?platform=${platform}&room_id=${roomId}`)
  return res.data
}

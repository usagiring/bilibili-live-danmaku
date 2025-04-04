import axios from 'axios'

let BASE_URL = ''
export function init({ port }) {
  BASE_URL = `http://127.0.0.1:${port}`
}

export async function getSetting() {
  const res = await axios.get(`${BASE_URL}/api/setting`)
  return res.data
}

export async function getGiftConfig(roomId) {
  const res = await axios.get(`${BASE_URL}/api/room/${roomId}/gift/map`)
  return res.data
}
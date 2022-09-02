import axios from 'axios'

let BASE_URL = ''
export function init({ port }) {
  BASE_URL = `http://127.0.0.1:${port}`
}

export async function getSetting() {
  const res = await axios.get(`${BASE_URL}/api/settings`)
  return res.data
}

export async function getGiftConfig() {
  const res = await axios.get(`${BASE_URL}/api/gifts/config`)
  return res.data
}

export async function getExampleMessages() {
  const res = await axios.get(`${BASE_URL}/api/messages/examples`)
  return res.data
}
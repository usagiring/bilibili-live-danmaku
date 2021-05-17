import axios from 'axios'
import { BASE_URL } from './const'

export async function connect({ roomId }) {
  const res = await axios.post(`${BASE_URL}/api/rooms/${roomId}/connect`)
  return res.data
}

export async function disconnect({ roomId }) {
  const res = await axios.post(`${BASE_URL}/api/rooms/${roomId}/disconnect`)
  return res.data
}

export async function touch() {
  const res = await axios.get(`${BASE_URL}/api/touch`)
  return res.data
}

export async function getRealTimeViewersCount({ roomId }) {
  const res = await axios.get(`${BASE_URL}/api/rooms/${roomId}/real-time/viewers/count`)
  return res.data
}

export async function getRoomStatus({ roomId }) {
  const res = await axios.get(`${BASE_URL}/api/rooms/${roomId}/status`)
  return res.data
}
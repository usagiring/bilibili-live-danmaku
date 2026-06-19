import axios from 'axios'
import config from './config'

export async function getClientConfig({ clientId }: { clientId: string }) {
  const res = await axios.get(`${config.baseUrl}/api/client/config/info`, { params: { clientId } })
  return res.data
}


export async function getGiftConfig(roomId: string = '0') {
  const res = await axios.get(`${config.baseUrl}/api/room/${roomId}/gift/map`)
  return res.data
}
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

export async function clearDB({ names }) {
  const res = await axios.post(`${BASE_URL}/api/dbs/clear`, {
    names
  })
  return res.data
}

export async function backupDB({ names }) {
  const res = await axios.post(`${BASE_URL}/api/dbs/backup`, {
    names
  })
  return res.data
}

// { [any]: any }
export async function mergeSetting(settings) {
  const res = await axios.put(`${BASE_URL}/api/settings/merge`, settings)
  return res.data
}

export async function replaceSetting(settings) {
  const res = await axios.put(`${BASE_URL}/api/settings/replace`, settings)
  return res.data
}

export async function updateSetting(settings) {
  const res = await axios.put(`${BASE_URL}/api/settings/update`, settings)
  return res.data
}

export async function clearMessage() {
  const res = await axios.post(`${BASE_URL}/api/messages/clear`)
  return res.data
}

export async function queryGifts(body) {
  const res = await axios.post(`${BASE_URL}/api/gifts/query`, body)
  return res.data
}

export async function queryInteracts(body) {
  const res = await axios.post(`${BASE_URL}/api/interacts/query`, body)
  return res.data
}

export async function queryComments(body) {
  const res = await axios.post(`${BASE_URL}/api/comments/query`, body)
  return res.data
}

export async function queryLotteryHistories(body) {
  const res = await axios.post(`${BASE_URL}/api/lottery-histories/query`, body)
  return res.data
}

export async function deleteLotteryHistories(body) {
  const res = await axios.delete(`${BASE_URL}/api/lottery-histories`, body)
  return res.data
}

export async function addLotteryHistory(body) {
  const res = await axios.post(`${BASE_URL}/api/lottery-histories`, body)
  return res.data
}

export async function countComments(body) {
  const res = await axios.post(`${BASE_URL}/api/comments/count`, body)
  return res.data
}

export async function countInteracts(body) {
  const res = await axios.post(`${BASE_URL}/api/interacts/count`, body)
  return res.data
}

export async function countGifts(body) {
  const res = await axios.post(`${BASE_URL}/api/gifts/count`, body)
  return res.data
}

export async function sendMessages(body) {
  const res = await axios.post(`${BASE_URL}/api/messages/send`, body)
  return res.data
}

export async function sendExampleMessages(body) {
  const res = await axios.post(`${BASE_URL}/api/messages/examples/send`, body)
  return res.data
}

export async function getGiftConfig() {
  const res = await axios.get(`${BASE_URL}/api/gifts/config`)
  return res.data
}

export async function getVoices() {
  const res = await axios.get(`${BASE_URL}/api/voices`)
  return res.data
}

export async function speak(body) {
  const res = await axios.post(`${BASE_URL}/api/speak`, body)
  return res.data
}

export async function statistic(body) {
  const res = await axios.post(`${BASE_URL}/api/statistic`, body)
  return res.data
}

export async function commentWordExtract(body) {
  const res = await axios.post(`${BASE_URL}/api/comments/word-extract`, body)
  return res.data
}

export async function exportFile(body) {
  const res = await axios.post(`${BASE_URL}/api/export`, body, {
    // responseType: 'stream', // ?????
    // decompress: false,
    transitional: {
      forcedJSONParsing: false
    }
  })
  return res.data
}

export async function initialASR(body) {
  const res = await axios.post(`${BASE_URL}/api/asr/initial`, body)
  return res.data
}

export async function closeASR(body) {
  const res = await axios.post(`${BASE_URL}/api/asr/close`, body)
  return res.data
}

export async function getASRStatus() {
  const res = await axios.get(`${BASE_URL}/api/asr/status`)
  return res.data
}

export async function translate(body) {
  const res = await axios.post(`${BASE_URL}/api/translate`, body)
  return res.data
}
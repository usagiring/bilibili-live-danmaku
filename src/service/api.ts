import axios from 'axios'
import { BASE_URL } from '../service/config-loader'

export async function connect({ roomId, uid }) {
  const res = await axios.post(`${BASE_URL}/api/room/${roomId}/connect`, {
    roomId,
    uid,
  })
  return res.data
}

export async function disconnect({ roomId }) {
  const res = await axios.post(`${BASE_URL}/api/room/${roomId}/disconnect`)
  return res.data
}

export async function touch() {
  const res = await axios.get(`${BASE_URL}/api/touch`)
  return res.data
}

export async function getRealTimeViewersCount({ roomId }) {
  const res = await axios.get(`${BASE_URL}/api/room/${roomId}/real-time/viewer/count`)
  return res.data
}

export async function getRoomStatus({ roomId }) {
  const res = await axios.get(`${BASE_URL}/api/room/${roomId}/status`)
  return res.data
}

export async function clearDB({ names }) {
  const res = await axios.post(`${BASE_URL}/api/db/clear`, {
    names
  })
  return res.data
}

export async function backupDB({ names }) {
  const res = await axios.post(`${BASE_URL}/api/db/backup`, {
    names
  })
  return res.data
}

export async function updateSetting(settings) {
  const res = await axios.put(`${BASE_URL}/api/setting`, {
    upsert: settings
  })
  return res.data
}

export async function clearMessage() {
  const res = await axios.post(`${BASE_URL}/api/message/clear`)
  return res.data
}

export async function queryGifts(body) {
  const res = await axios.post(`${BASE_URL}/api/gift/query`, body)
  return res.data
}

export async function queryInteracts(body) {
  const res = await axios.post(`${BASE_URL}/api/interact/query`, body)
  return res.data
}

export async function queryComments(body) {
  const res = await axios.post(`${BASE_URL}/api/comment/query`, body)
  return res.data
}

export async function queryLotteryHistories(body) {
  const res = await axios.post(`${BASE_URL}/api/lottery/history/query`, body)
  return res.data
}

export async function deleteLotteryHistories(body) {
  const res = await axios.delete(`${BASE_URL}/api/lottery/history`, body)
  return res.data
}

export async function addLotteryHistory(body) {
  const res = await axios.post(`${BASE_URL}/api/lottery/history`, body)
  return res.data
}

export async function countComments(body) {
  const res = await axios.post(`${BASE_URL}/api/comment/count`, body)
  return res.data
}

export async function countInteracts(body) {
  const res = await axios.post(`${BASE_URL}/api/interact/count`, body)
  return res.data
}

export async function countGifts(body) {
  const res = await axios.post(`${BASE_URL}/api/gift/count`, body)
  return res.data
}

export async function sendMessages(body) {
  const res = await axios.post(`${BASE_URL}/api/message/send`, body)
  return res.data
}

// export async function sendExampleMessages(body) {
//   const res = await axios.post(`${BASE_URL}/api/messages/examples/send`, body)
//   return res.data
// }

export async function getGiftConfig(roomId: string) {
  const res = await axios.get(`${BASE_URL}/api/room/${roomId}/gift/map`)
  return res.data
}

// export async function getVoices() {
//   const res = await axios.get(`${BASE_URL}/api/voices`)
//   return res.data
// }

// export async function speak(body) {
//   const res = await axios.post(`${BASE_URL}/api/speak`, body)
//   return res.data
// }

export async function statistic(body) {
  const res = await axios.post(`${BASE_URL}/api/statistic`, body)
  return res.data
}

export async function commentWordExtract(body) {
  const res = await axios.post(`${BASE_URL}/api/statistic/comment/keyword-extract`, body)
  return res.data
}

export async function exportFile(body) {
  const res = await axios.post(`${BASE_URL}/api/statistic/gift/export`, body, {
    // responseType: 'stream', // ?????
    // decompress: false,
    transitional: {
      forcedJSONParsing: false,
    }
  })
  return res.data
}

export async function initialASR(body) {
  const res = await axios.post(`${BASE_URL}/api/asr/initial`, body)
  return res.data
}

export async function startLiveStreamASR(body) {
  const res = await axios.post(`${BASE_URL}/api/asr/live/start`, body)
  return res.data
}

export async function closeLiveStreamASR(body) {
  const res = await axios.post(`${BASE_URL}/api/asr/live/close`, body)
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

export async function translateSentence(body) {
  const res = await axios.post(`${BASE_URL}/api/translate/sentence`, body)
  return res.data
}

export async function translateOpen(body) {
  const res = await axios.post(`${BASE_URL}/api/translate/open`, body)
  return res.data
}

export async function translateClose(body) {
  const res = await axios.post(`${BASE_URL}/api/translate/close`, body)
  return res.data
}

export async function getTranslateStatus() {
  const res = await axios.get(`${BASE_URL}/api/translate/status`)
  return res.data
}

export async function needRefreshCookie() {
  const res = await axios.get(`${BASE_URL}/api/cookie/refresh/check`)
  return res.data
}

export async function refreshCookie(body: { refreshToken: string }) {
  const res = await axios.post(`${BASE_URL}/api/cookie/refresh`, body)
  return res.data
}

export async function initialSpeechRegcognition(body) {
  const res = await axios.post(`${BASE_URL}/api/speech-recognition/initial`, body)
  return res.data
}

export async function speechToText(body) {
  const res = await axios.post(`${BASE_URL}/api/speech-recognition/speech-to-text`, body)
  return res.data
}

export async function sendComment({ message, roomId }) {
  const res = await axios.post(`${BASE_URL}/api/bilibili/room/${roomId}/comment/send`, {
    comment: message
  })
  return res.data
}

export async function getMedalList({ page, pageSize }) {
  const res = await axios.get(`${BASE_URL}/api/bilibili/medal/list?page=${page}&pageSize=${pageSize}`)
  return res.data
}

export async function getRoomInfoV2(roomId) {
  const res = await axios.get(`${BASE_URL}/api/bilibili/room/${roomId}/info`)
  return res.data
}

export async function getRoomInfoByIds(roomIds) {
  const res = await axios.post(`${BASE_URL}/api/bilibili/room/info`, {
    roomIds: roomIds
  })
  return res.data
}

export async function getGuardInfo(roomId, uid) {
  const res = await axios.get(`${BASE_URL}/api/bilibili/room/${roomId}/guard?uid=${uid}`)
  return res.data
}

export async function getUserInfoV2(uid) {
  const res = await axios.get(`${BASE_URL}/api/bilibili/user/${uid}/info`)
  return res.data
}

export async function getUserInfoInRoom(roomId) {
  const res = await axios.get(`${BASE_URL}/api/bilibili/room/${roomId}/user/info`)
  return res.data
}

export async function wearMedal(medalId) {
  const res = await axios.post(`${BASE_URL}/api/bilibili/medal/wear`, {
    medalId
  })
  return res.data
}

export async function getRandomPlayUrl({
  roomId,
  qn,
  withCookie
}) {
  const res = await axios.get(`${BASE_URL}/api/bilibili/room/${roomId}/playurl?qn=${qn}&withCookie=${withCookie}`)
  return res.data
}

export async function record({
  roomId,
  output,
  qn,
  platform,
  withCookie
}) {
  const res = await axios.post(`${BASE_URL}/api/room/${roomId}/record/start`, {
    output,
    qn,
    platform,
    withCookie
  })
  return res.data
}

export async function cancelRecord({
  roomId,
  recordId,
}) {
  const res = await axios.post(`${BASE_URL}/api/room/${roomId}/record/cancel`, {
    recordId
  })
  return res.data
}

export async function getRecordState({
  roomId
}) {
  const res = await axios.get(`${BASE_URL}/api/room/${roomId}/record/status`)
  return res.data
}

export async function getQrCode() {
  const res = await axios.get(`${BASE_URL}/api/login/qr-code/generate`)
  return res.data
}

export async function loginFromQrCode(qrCodeKey) {
  const res = await axios.get(`${BASE_URL}/api/login/qr-code/poll?qrCodeKey=${qrCodeKey}`)
  return res.data
}
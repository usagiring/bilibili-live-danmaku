import axios from 'axios'
import globalVar from './global'

export async function connect({ roomId, uid }) {
  const res = await axios.post(`${globalVar.baseUrl}/api/room/${roomId}/connect`, {
    roomId,
    uid,
  })
  return res.data
}

export async function disconnect({ roomId }) {
  const res = await axios.post(`${globalVar.baseUrl}/api/room/${roomId}/disconnect`)
  return res.data
}

export async function touch() {
  const res = await axios.get(`${globalVar.baseUrl}/api/touch`)
  return res.data
}

export async function getRealTimeViewersCount({ roomId }) {
  const res = await axios.get(`${globalVar.baseUrl}/api/room/${roomId}/real-time/viewer/count`)
  return res.data
}

export async function getRoomStatus({ roomId }) {
  const res = await axios.get(`${globalVar.baseUrl}/api/room/${roomId}/status`)
  return res.data
}

export async function clearDB({ names }) {
  const res = await axios.post(`${globalVar.baseUrl}/api/db/clear`, {
    names
  })
  return res.data
}

export async function backupDB({ names }) {
  const res = await axios.post(`${globalVar.baseUrl}/api/db/backup`, {
    names
  })
  return res.data
}

export async function updateSetting(settings) {
  const res = await axios.put(`${globalVar.baseUrl}/api/setting`, {
    upsert: settings
  })
  return res.data
}

export async function clearMessage() {
  const res = await axios.post(`${globalVar.baseUrl}/api/message/clear`)
  return res.data
}

export async function queryGifts(body) {
  const res = await axios.post(`${globalVar.baseUrl}/api/gift/query`, body)
  return res.data
}

export async function queryInteracts(body) {
  const res = await axios.post(`${globalVar.baseUrl}/api/interact/query`, body)
  return res.data
}

export async function queryComments(body) {
  const res = await axios.post(`${globalVar.baseUrl}/api/comment/query`, body)
  return res.data
}

export async function queryLotteryHistories(body) {
  const res = await axios.post(`${globalVar.baseUrl}/api/lottery/history/query`, body)
  return res.data
}

export async function deleteLotteryHistories(body) {
  const res = await axios.delete(`${globalVar.baseUrl}/api/lottery/history`, body)
  return res.data
}

export async function addLotteryHistory(body) {
  const res = await axios.post(`${globalVar.baseUrl}/api/lottery/history`, body)
  return res.data
}

export async function countComments(body) {
  const res = await axios.post(`${globalVar.baseUrl}/api/comment/count`, body)
  return res.data
}

export async function countInteracts(body) {
  const res = await axios.post(`${globalVar.baseUrl}/api/interact/count`, body)
  return res.data
}

export async function countGifts(body) {
  const res = await axios.post(`${globalVar.baseUrl}/api/gift/count`, body)
  return res.data
}

export async function sendMessages(body) {
  const res = await axios.post(`${globalVar.baseUrl}/api/message/send`, body)
  return res.data
}

// export async function sendExampleMessages(body) {
//   const res = await axios.post(`${globalVar.baseUrl}/api/messages/examples/send`, body)
//   return res.data
// }

export async function getGiftConfig(roomId: string) {
  const res = await axios.get(`${globalVar.baseUrl}/api/room/${roomId}/gift/map`)
  return res.data
}

// export async function getVoices() {
//   const res = await axios.get(`${globalVar.baseUrl}/api/voices`)
//   return res.data
// }

// export async function speak(body) {
//   const res = await axios.post(`${globalVar.baseUrl}/api/speak`, body)
//   return res.data
// }

export async function statistic(body) {
  const res = await axios.post(`${globalVar.baseUrl}/api/statistic`, body)
  return res.data
}

export async function commentWordExtract(body) {
  const res = await axios.post(`${globalVar.baseUrl}/api/statistic/comment/keyword-extract`, body)
  return res.data
}

export async function exportFile(body) {
  const res = await axios.post(`${globalVar.baseUrl}/api/statistic/gift/export`, body, {
    // responseType: 'stream', // ?????
    // decompress: false,
    transitional: {
      forcedJSONParsing: false,
    }
  })
  return res.data
}

export async function initialASR(body) {
  const res = await axios.post(`${globalVar.baseUrl}/api/asr/initial`, body)
  return res.data
}

export async function startLiveStreamASR(body) {
  const res = await axios.post(`${globalVar.baseUrl}/api/asr/live/start`, body)
  return res.data
}

export async function closeLiveStreamASR(body) {
  const res = await axios.post(`${globalVar.baseUrl}/api/asr/live/close`, body)
  return res.data
}

export async function closeASR(body) {
  const res = await axios.post(`${globalVar.baseUrl}/api/asr/close`, body)
  return res.data
}

export async function getASRStatus() {
  const res = await axios.get(`${globalVar.baseUrl}/api/asr/status`)
  return res.data
}

export async function translateSentence(body) {
  const res = await axios.post(`${globalVar.baseUrl}/api/translate/sentence`, body)
  return res.data
}

export async function translateOpen(body) {
  const res = await axios.post(`${globalVar.baseUrl}/api/translate/open`, body)
  return res.data
}

export async function translateClose(body) {
  const res = await axios.post(`${globalVar.baseUrl}/api/translate/close`, body)
  return res.data
}

export async function getTranslateStatus() {
  const res = await axios.get(`${globalVar.baseUrl}/api/translate/status`)
  return res.data
}

export async function needRefreshCookie() {
  const res = await axios.get(`${globalVar.baseUrl}/api/cookie/refresh/check`)
  return res.data
}

export async function refreshCookie(body: { refreshToken: string }) {
  const res = await axios.post(`${globalVar.baseUrl}/api/cookie/refresh`, body)
  return res.data
}

export async function initialSpeechRegcognition(body) {
  const res = await axios.post(`${globalVar.baseUrl}/api/speech-recognition/initial`, body)
  return res.data
}

export async function speechToText(body) {
  const res = await axios.post(`${globalVar.baseUrl}/api/speech-recognition/speech-to-text`, body)
  return res.data
}

export async function sendComment({ message, roomId }) {
  const res = await axios.post(`${globalVar.baseUrl}/api/bilibili/room/${roomId}/comment/send`, {
    comment: message
  })
  return res.data
}

export async function getMedalList({ page, pageSize }) {
  const res = await axios.get(`${globalVar.baseUrl}/api/bilibili/medal/list?page=${page}&pageSize=${pageSize}`)
  return res.data
}

export async function getRoomInfoV2(roomId) {
  const res = await axios.get(`${globalVar.baseUrl}/api/bilibili/room/${roomId}/info`)
  return res.data
}

export async function getRoomInfoByIds(roomIds) {
  const res = await axios.post(`${globalVar.baseUrl}/api/bilibili/room/info`, {
    roomIds: roomIds
  })
  return res.data
}

export async function getGuardInfo(roomId, uid) {
  const res = await axios.get(`${globalVar.baseUrl}/api/bilibili/room/${roomId}/guard?uid=${uid}`)
  return res.data
}

export async function getUserInfoV2(uid) {
  const res = await axios.get(`${globalVar.baseUrl}/api/bilibili/user/${uid}/info`)
  return res.data
}

export async function getUserInfoInRoom(roomId) {
  const res = await axios.get(`${globalVar.baseUrl}/api/bilibili/room/${roomId}/user/info`)
  return res.data
}

export async function wearMedal(medalId) {
  const res = await axios.post(`${globalVar.baseUrl}/api/bilibili/medal/wear`, {
    medalId
  })
  return res.data
}

export async function getRandomPlayUrl({
  roomId,
  qn,
  withCookie = false,
}) {
  const res = await axios.get(`${globalVar.baseUrl}/api/bilibili/room/${roomId}/playurl?qn=${qn}&withCookie=${withCookie}`)
  return res.data
}

export async function record({
  roomId,
  output,
  qn,
  platform,
  withCookie
}) {
  const res = await axios.post(`${globalVar.baseUrl}/api/room/${roomId}/record/start`, {
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
  const res = await axios.post(`${globalVar.baseUrl}/api/room/${roomId}/record/cancel`, {
    recordId
  })
  return res.data
}

export async function getRecordState({
  roomId
}) {
  const res = await axios.get(`${globalVar.baseUrl}/api/room/${roomId}/record/status`)
  return res.data
}

export async function getQrCode() {
  const res = await axios.get(`${globalVar.baseUrl}/api/login/qr-code/generate`)
  return res.data
}

export async function loginFromQrCode(qrCodeKey) {
  const res = await axios.get(`${globalVar.baseUrl}/api/login/qr-code/poll?qrCodeKey=${qrCodeKey}`)
  return res.data
}

export async function addLike({
  roomId,
  ruid,
  count
}) {
  const res = await axios.post(`${globalVar.baseUrl}/api/bilibili/room/${roomId}/like`, {
    ruid,
    count,
  })
  return res.data
}
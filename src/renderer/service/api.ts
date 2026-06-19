import axios from 'axios'

const baseUrl: string = await window.getBaseUrl()

// ==================== Room ====================

export async function getRoomInfoV2({ roomId }: { roomId: string }) {
  const res = await axios.get(`${baseUrl}/api/room/info`, { params: { roomId } })
  return res.data
}

export async function getRoomInfoByIds(roomIds: string[]) {
  const res = await axios.post(`${baseUrl}/api/bilibili/room/info`, { roomIds })
  return res.data
}

export async function connect({ roomId, userId, clientId }: { roomId: string; userId?: string; clientId: string }) {
  const res = await axios.post(`${baseUrl}/api/room/connect`, { roomId, userId, clientId })
  return res.data
}

export async function disconnect({ roomId, clientId }: { roomId: string; clientId: string }) {
  const res = await axios.post(`${baseUrl}/api/room/disconnect`, { roomId, clientId })
  return res.data
}

export async function getRealTimeViewersCount({ roomId, startedAt }: { roomId: number; startedAt?: number }) {
  const res = await axios.get(`${baseUrl}/api/room/real-time/viewer/count`, { params: { roomId: String(roomId), startedAt } })
  return res.data
}

export async function getRoomStatus({ roomId }: { roomId?: number }) {
  const res = await axios.get(`${baseUrl}/api/room/status`, { params: { roomId: roomId ? String(roomId) : undefined } })
  return res.data
}

// ==================== Record ====================

export async function record(body: { roomId: number; output?: string; qn?: number; platform?: string; withCookie?: boolean }) {
  const res = await axios.post(`${baseUrl}/api/room/record/start`, { ...body, roomId: String(body.roomId) })
  return res.data
}

export async function cancelRecord(body: { roomId: number; recordId: string }) {
  const res = await axios.post(`${baseUrl}/api/room/record/cancel`, { ...body, roomId: String(body.roomId) })
  return res.data
}

export async function getRecordState(body: { roomId?: number }) {
  const res = await axios.get(`${baseUrl}/api/room/record/status`, { params: { roomId: body.roomId ? String(body.roomId) : undefined } })
  return res.data
}

// ==================== Message ====================

export async function queryMessages(body: { category?: string; roomId?: number; userId?: string; skip?: number; limit?: number; sort?: any }) {
  const res = await axios.get(`${baseUrl}/api/message/query`, { params: body })
  return res.data
}

export async function countMessages(body: { roomId?: number; userId?: string; category?: string }) {
  const res = await axios.get(`${baseUrl}/api/message/count`, { params: body })
  return res.data
}

// ==================== DM (弹幕/礼物广播) ====================

export async function clearDM() {
  const res = await axios.post(`${baseUrl}/api/dm/clear`)
  return res.data
}

export async function sendDM(category: string, data: any) {
  const res = await axios.post(`${baseUrl}/api/dm/send`, { category, data })
  return res.data
}

// ==================== Lottery ====================

export async function queryLotteryHistories(body: { roomId?: number; skip?: number; limit?: number; sort?: any }) {
  const res = await axios.post(`${baseUrl}/api/lottery/history/query`, body)
  return res.data
}

export async function deleteLotteryHistories(body: { roomId?: number }) {
  const res = await axios.delete(`${baseUrl}/api/lottery/history`, { data: body })
  return res.data
}

export async function addLotteryHistory(body: any) {
  const res = await axios.post(`${baseUrl}/api/lottery/history`, body)
  return res.data
}

// ==================== Statistic ====================

export async function statistic(body: { roomId: number; start: string; end: string }) {
  const res = await axios.post(`${baseUrl}/api/statistic`, body)
  return res.data
}

export async function commentWordExtract(body: { roomId: number; start: string; end: string }) {
  const res = await axios.post(`${baseUrl}/api/statistic/comment/keyword-extract`, body)
  return res.data
}

export async function exportFile(body: { roomId: number; start: string; end: string }) {
  const res = await axios.post(`${baseUrl}/api/statistic/gift/export`, body, {
    transitional: { forcedJSONParsing: false },
  })
  return res.data
}

// ==================== ASR ====================

export async function initialASR(body: { appKey: string; accessKeyId: string; accessKeySecret: string }) {
  const res = await axios.post(`${baseUrl}/api/automatic-speech-recognition/initial`, body)
  return res.data
}

export async function startLiveStreamASR(body: { playUrl: string; ffmpegPath?: string }) {
  const res = await axios.post(`${baseUrl}/api/automatic-speech-recognition/live/start`, body)
  return res.data
}

export async function closeLiveStreamASR() {
  const res = await axios.post(`${baseUrl}/api/automatic-speech-recognition/live/close`)
  return res.data
}

export async function closeASR() {
  const res = await axios.post(`${baseUrl}/api/automatic-speech-recognition/close`)
  return res.data
}

export async function getASRStatus() {
  const res = await axios.get(`${baseUrl}/api/automatic-speech-recognition/status`)
  return res.data
}

export async function sendAudio(data: Int16Array) {
  const res = await axios.post(`${baseUrl}/api/automatic-speech-recognition/audio`, { data })
  return res.data
}

// ==================== Translate ====================

export async function translateSentence(body: { text: string; from?: string; to?: string; accessKeyId: string; accessKeySecret: string; payload?: any }) {
  const res = await axios.post(`${baseUrl}/api/translate/sentence`, body)
  return res.data
}

export async function translateOpen(body: { accessKeyId: string; accessKeySecret: string; fromLang: string; toLang: string }) {
  const res = await axios.post(`${baseUrl}/api/translate/open`, body)
  return res.data
}

export async function translateClose() {
  const res = await axios.post(`${baseUrl}/api/translate/close`)
  return res.data
}

export async function getTranslateStatus() {
  const res = await axios.get(`${baseUrl}/api/translate/status`)
  return res.data
}

// ==================== Speech Recognition ====================

export async function initialSpeechRecognition(body: { accessKeyId: string; accessKeySecret: string }) {
  const res = await axios.post(`${baseUrl}/api/speech-recognition/initial`, body)
  return res.data
}

export async function speechToText(body: { appKey: string; payload?: any }) {
  const res = await axios.post(`${baseUrl}/api/speech-recognition/speech-to-text`, body)
  return res.data
}

// ==================== Cookie / Auth ====================

export async function needRefreshCookie() {
  const res = await axios.get(`${baseUrl}/api/cookie/refresh/check`)
  return res.data
}

export async function refreshCookie(body: { refreshToken: string }) {
  const res = await axios.post(`${baseUrl}/api/cookie/refresh`, body)
  return res.data
}

export async function generateQRCode() {
  const res = await axios.get(`${baseUrl}/api/login/qr-code/generate`)
  return res.data
}

export async function pollQRCode(qrCodeKey: string) {
  const res = await axios.get(`${baseUrl}/api/login/qr-code/poll`, { params: { qrCodeKey } })
  return res.data
}

// ==================== Bilibili Proxy ====================

export async function getUserInfoInRoom(roomId: number) {
  const res = await axios.get(`${baseUrl}/api/bilibili/room/user/info`, { params: { roomId: String(roomId) } })
  return res.data
}

export async function getGuardInfo({ roomId, userId }: { roomId: string; userId: string }) {
  const res = await axios.get(`${baseUrl}/api/bilibili/room/guard`, { params: { roomId, uid: userId } })
  return res.data
}

export async function sendComment({ roomId, comment }: { roomId: number; comment: string }) {
  const res = await axios.post(`${baseUrl}/api/bilibili/room/comment/send`, { roomId: String(roomId), comment })
  return res.data
}

export async function getRandomPlayUrl(body: { roomId: number; qn?: number; withCookie?: boolean }) {
  const res = await axios.get(`${baseUrl}/api/bilibili/room/playurl`, { params: { roomId: String(body.roomId), qn: body.qn, withCookie: body.withCookie ? 'true' : undefined } })
  return res.data
}

export async function getUserInfoV2({ userId }: { userId: string }) {
  const res = await axios.get(`${baseUrl}/api/bilibili/user/info`, { params: { userId } })
  return res.data
}

export async function wearMedal(medalId: number) {
  const res = await axios.post(`${baseUrl}/api/bilibili/medal/wear`, { medalId: String(medalId) })
  return res.data
}

export async function getMedalList({ page, pageSize }: { page?: number; pageSize?: number }) {
  const res = await axios.get(`${baseUrl}/api/bilibili/medal/list`, { params: { page, pageSize } })
  return res.data
}

export async function addLike({ roomId, ruid, count }: { roomId: number; ruid: number; count: number }) {
  const res = await axios.post(`${baseUrl}/api/bilibili/room/like`, { roomId: String(roomId), ruid: String(ruid), count })
  return res.data
}

// ==================== Client Config ====================

export async function getClientConfig(clientId: string) {
  const res = await axios.get(`${baseUrl}/api/client/config/info`, { params: { clientId } })
  return res.data
}

export async function updateClientConfig({ clientId, kvs }: { clientId: string, kvs: Array<{ key: string; value: any }> }) {
  const res = await axios.post(`${baseUrl}/api/client/config/update`, { clientId, kvs })
  return res.data
}

export async function registryClient({ clientId }) {
  const res = await axios.post(`${baseUrl}/api/client/register`, {
    clientId
  })
  return res.data
}

// ==================== Health ====================

export async function touch() {
  const res = await axios.get(`${baseUrl}/api/touch`)
  return res.data
}


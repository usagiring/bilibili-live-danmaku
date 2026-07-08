import axios from 'axios'

const baseUrl: string = await window.getBaseUrl()

// ==================== Room ====================

export async function getRoomInfoV2({ roomId }: { roomId: string }) {
  const res = await axios.get(`${baseUrl}/api/room/info`, { params: { roomId } })
  return res.data
}

export async function getRoomInfoByIds({ roomIds }: { roomIds: string[] }) {
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

export async function getRoomStatus({ roomIds, clientId }: { roomIds: string[]; clientId: string }) {
  const res = await axios.get(`${baseUrl}/api/room/status`, { params: { roomIds: roomIds.join(','), clientId } })
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
export interface MessageQuery {
  roomId: string
  category?: string | string[]
  search?: string
  userId?: string
  username?: string
  coinType?: string | string[]
  sendAtGte?: number
  sendAtLte?: number
  order?: string
  cursor?: string
  totalPriceGte?: number
  totalPriceLte?: number
  limit?: number
}

export async function queryMessages(body: MessageQuery) {
  if (Array.isArray(body.category)) {
    body.category = body.category.join(',')
  }
  if (Array.isArray(body.coinType)) {
    body.coinType = body.coinType.join(',')
  }
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

export async function sendDM({ clientId, data }: { clientId: string; data: any }) {
  const res = await axios.post(`${baseUrl}/api/dm/send`, { clientId, data })
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

export async function getStats({ roomId, startTime, endTime }: { roomId: string; startTime: number; endTime: number }) {
  const res = await axios.get(`${baseUrl}/api/stats`, {
    params: { roomId, startTime, endTime },
  })
  return res.data
}

export async function commentWordExtract({ roomId, startTime, endTime }: { roomId: string; startTime: number; endTime: number }) {
  const res = await axios.get(`${baseUrl}/api/stats/comment/keyword-extract`, {
    params: { roomId, startTime, endTime },
  })
  return res.data
}

export async function exportFile({ roomId, startTime, endTime }: { roomId: string; startTime: number; endTime: number }) {
  const res = await axios.get(`${baseUrl}/api/stats/gift/export`, {
    params: { roomId, startTime, endTime },
  })
  return res.data
}

export async function getGiftList({ roomId, roomUserId }: { roomId: string; roomUserId: string }) {
  const res = await axios.get(`${baseUrl}/api/room/gift/list`, { params: { roomId, roomUserId } })
  return res.data
}

export async function speechToTextDecode({
  clientId,
  roomId,
  buffer,
}: {
  clientId: string
  roomId: string
  buffer: Float32Array<ArrayBuffer>
}) {
  const res = await axios.post(`${baseUrl}/api/speech-to-text/decode`, buffer.buffer, {
    headers: { 'Content-Type': 'application/octet-stream' },
    params: { clientId, roomId },
  })
  return res.data
}

export async function speechToTextInitial({ clientId, roomId }: { clientId: string; roomId: string }) {
  const res = await axios.post(`${baseUrl}/api/speech-to-text/initial`, {
    clientId,
    roomId,
  })
  return res.data
}

export async function speechToTextStatus({ clientId, roomId }: { clientId: string; roomId: string }) {
  const res = await axios.get(`${baseUrl}/api/speech-to-text/status`, { params: { roomId, clientId } })
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

export async function pollQRCode({ clientId, qrCodeKey }: { clientId: string; qrCodeKey: string }) {
  const res = await axios.get(`${baseUrl}/api/login/qr-code/poll`, { params: { clientId, qrCodeKey } })
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
  const res = await axios.get(`${baseUrl}/api/bilibili/room/playurl`, {
    params: { roomId: String(body.roomId), qn: body.qn, withCookie: body.withCookie ? 'true' : undefined },
  })
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

export async function addLike({
  clientId,
  roomId,
  roomUserId,
  count,
}: {
  clientId: string
  roomId: string
  roomUserId: string
  count: number
}) {
  const res = await axios.post(`${baseUrl}/api/bilibili/room/like`, { clientId, roomId, roomUserId, count })
  return res.data
}

// ==================== Client Config ====================

export async function getClientConfig(clientId: string) {
  const res = await axios.get(`${baseUrl}/api/client/config/info`, { params: { clientId } })
  return res.data
}

export async function updateClientConfig({ clientId, kvs }: { clientId: string; kvs: Array<{ key: string; value: any }> }) {
  const res = await axios.post(`${baseUrl}/api/client/config/update`, { clientId, kvs })
  return res.data
}

export async function restoreDmStyle({ clientId }: { clientId: string }) {
  const res = await axios.post(`${baseUrl}/api/client/config/dm-style/restore`, {
    clientId,
  })
  return res.data
}

export async function registryClient({ clientId }) {
  const res = await axios.post(`${baseUrl}/api/client/register`, {
    clientId,
  })
  return res.data
}

// ==================== Health ====================

export async function touch() {
  const res = await axios.get(`${baseUrl}/api/touch`)
  return res.data
}

export async function getPlayUrl({
  roomId,
  qn,
  withCookie,
  clientId,
}: {
  roomId: string
  qn?: number
  withCookie?: boolean
  clientId: string
}) {
  const res = await axios.get(`${baseUrl}/api/bilibili/room/playurl`, {
    params: { roomId, clientId, qn, withCookie },
  })
  return res.data
}

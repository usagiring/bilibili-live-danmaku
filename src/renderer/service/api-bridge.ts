// 渲染进程通过 preload 暴露的 window.api 调用后端 API
const api = (window as any).api

export const {
  // Room
  getRoomInfoV2,
  getRoomInfoByIds,
  connect,
  disconnect,
  getRealTimeViewersCount,
  getRoomStatus,
  // Record
  record,
  cancelRecord,
  getRecordState,
  // Message
  queryMessages,
  countMessages,
  // DM
  clearDM,
  sendDM,
  // Lottery
  queryLotteryHistories,
  addLotteryHistory,
  deleteLotteryHistories,
  // Statistic
  statistic,
  commentWordExtract,
  exportFile,
  // ASR
  initialASR,
  startLiveStreamASR,
  closeLiveStreamASR,
  closeASR,
  getASRStatus,
  sendAudio,
  // Translate
  translateSentence,
  translateOpen,
  translateClose,
  getTranslateStatus,
  // Speech Recognition
  initialSpeechRecognition,
  speechToText,
  // Cookie / Auth
  needRefreshCookie,
  refreshCookie,
  generateQRCode,
  pollQRCode,
  // Bilibili Proxy
  getUserInfoInRoom,
  getGuardInfo,
  sendComment,
  getRandomPlayUrl,
  getUserInfoV2,
  wearMedal,
  getMedalList,
  addLike,
  // Client Config
  getClientConfig,
  updateClientConfig,
  // Health
  touch,
} = api

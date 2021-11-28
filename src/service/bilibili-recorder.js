import fs from 'fs'
import path from 'path'
import BilibiliRecorder from '@tokine/bilibili-recorder'
import httpAdapter from './http'
import { strict as assert } from 'assert'
import emitter from './event'
import { dateFormat } from './util'

const qualityMap = {
  "原画": 10000,
  '蓝光': 400,
  '超清': 250,
  '高清': 150,
  '流畅': 80
}

const __status = {}

const recorder = new BilibiliRecorder(
  {
    emitter: emitter
  },
  { adapter: httpAdapter, }
)

export {
  record,
  getRandomPlayUrl,
  cancelRecord,
  setStatus,
  getStatus,
}

async function record({ roomId, recordDir, quality, cookie }) {
  const qn = quality ? qualityMap[quality] : 400
  console.log(`record: ROOM_ID: ${roomId} RECORD_DIR: ${recordDir}`)
  try {
    const stat = fs.statSync(recordDir)
    assert.ok(stat.isDirectory())
  } catch (e) {
    console.log(e)
    fs.mkdirSync(recordDir)
  }

  const output = path.join(recordDir, `./${roomId}_${dateFormat(new Date(), 'YYYYMMDD_HHmmss')}.flv`)
  console.log(`record: OUTPUT: ${output}`)

  const axiosOptions = {}
  if (cookie) {
    axiosOptions.headers = {
      cookie: cookie
    }
  }
  return recorder.record({ roomId, output, qn }, axiosOptions)
}

async function getRandomPlayUrl({ roomId, quality, cookie }) {
  const qn = quality ? qualityMap[quality] : 400
  const axiosOptions = {}
  if (cookie) {
    axiosOptions.headers = {
      cookie: cookie
    }
  }
  return recorder.getRandomPlayUrl({ roomId, qn }, axiosOptions)
}

async function cancelRecord(id) {
  return recorder.cancelRecord(id)
}

function setStatus(status) {
  return Object.assign(__status, status)
}

function getStatus() {
  return __status
}
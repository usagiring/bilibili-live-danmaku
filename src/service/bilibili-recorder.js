import fs from 'fs'
import path from 'path'
import BilibiliRecorder from '@tokine/bilibili-recorder'
import httpAdapter from './http'
import { strict as assert } from 'assert'
import { DEFAULT_RECORD_DIR } from './const'
import emitter from './event'

const qualityMap = {
  "原画": 10000,
  '蓝光': 400,
  '超清': 250,
  '高清': 150,
  '流畅': 80
}

const recorder = new BilibiliRecorder(
  {
    emitter: emitter
  },
  { adapter: httpAdapter, }
)

export {
  record,
  getRandomPlayUrl,
  cancelRecord
}

async function record({ roomId, recordDir, quality, cookie }) {
  const _recordDir = recordDir || DEFAULT_RECORD_DIR
  const qn = quality ? qualityMap[quality] : 400
  console.log(`record: ROOM_ID: ${roomId} RECORD_DIR: ${_recordDir}`)
  try {
    const stat = fs.statSync(_recordDir)
    assert.ok(stat.isDirectory())
  } catch (e) {
    console.log(e)
    fs.mkdirSync(_recordDir)
  }

  const output = path.join(_recordDir, `./${roomId}_${Date.now()}.flv`)
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
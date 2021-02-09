import fs from 'fs'
import path from 'path'
import BilibiliRecorder from '@tokine/bilibili-recorder'
import httpAdapter from './http'
import { strict as assert } from 'assert'
import { DEFAULT_RECORD_DIR } from './const'
const qualityMap = {
  "原画": 10000,
  '蓝光': 400,
  '超清': 250,
  '高清': 150,
  '流畅': 80
}

class Recorder {
  constructor() {
    this.recorder = new BilibiliRecorder(
      {},
      { adapter: httpAdapter, }
    )
  }

  async record(roomId, __recordDir, quality) {
    const recordDir = __recordDir || DEFAULT_RECORD_DIR
    const qn = quality ? qualityMap[quality] : 400
    console.log(`record: ROOM_ID: ${roomId} RECORD_DIR: ${recordDir}`)
    try {
      const stat = fs.statSync(recordDir)
      assert.ok(stat.isDirectory())
    } catch (e) {
      console.log(e)
      fs.mkdirSync(recordDir)
    }

    const output = path.join(recordDir, `./${roomId}_${Date.now()}.flv`)
    console.log(`record: OUTPUT: ${output}`)
    return this.recorder.record({ roomId, output, qn })
  }

  async getRandomPlayUrl(roomId, quality) {
    const qn = quality ? qualityMap[quality] : 400
    return this.recorder.getRandomPlayUrl({ roomId, qn })
  }

  async cancelRecord() {
    this.recorder.cancelRecord()
  }
}

export default new Recorder()

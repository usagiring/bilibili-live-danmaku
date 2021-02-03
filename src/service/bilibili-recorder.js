import fs from 'fs'
import path from 'path'
import BilibiliRecorder from '@tokine/bilibili-recorder'
import httpAdapter from './http'
import { strict as assert } from 'assert'
const RECORD_DIR = path.join(__dirname, '../../record')

class Recorder {
  constructor() {
    this.recorder = new BilibiliRecorder(
      {},
      { adapter: httpAdapter, }
    )
  }

  async record(roomId) {
    try {
      const stat = fs.statSync(RECORD_DIR)
      assert.ok(stat.isDirectory())
    } catch (e) {
      console.log(e)
      fs.mkdirSync(RECORD_DIR)
    }

    const output = path.join(RECORD_DIR, `./${roomId}_${Date.now()}.flv`)
    console.log(roomId)
    this.recorder.record({ roomId, output })
  }

  async getPlayUrl(roomId) {
    return this.recorder.getPlayUrl(roomId)
  }
}

export default new Recorder()

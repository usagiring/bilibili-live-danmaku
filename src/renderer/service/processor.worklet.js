class WorkletProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    console.log(`sampleRate: ${sampleRate}`)
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0][0] // 单声道采样数据, default 128 frame/times
    const pcmData = new Int16Array(input.length)

    // 32bit to 16bit
    for (let i = 0; i < input.length; i++) {
      let s = Math.max(-1, Math.min(1, input[i]))
      s = s < 0 ? s * 0x8000 : s * 0x7FFF
      pcmData[i] = s
    }

    // TODO
    const pcmStr = JSON.stringify(Array.from(pcmData))
    this.port.postMessage(pcmStr)

    return true
  }
}

registerProcessor("worklet-processor", WorkletProcessor);
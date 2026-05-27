import { baseWsUrl } from '../service/config-loader'

const ws = new WebSocket(baseWsUrl)
ws.onopen = () => { }

ws.onclose = (code) => {
  console.log('ws close: ', code)
}

ws.onerror = (err) => {
  console.error(err)
}

export default ws

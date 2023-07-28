import { BASE_WS_URL } from '../service/config-loader'

const ws = new WebSocket(BASE_WS_URL)
ws.onopen = () => { }

ws.onclose = (code) => {
  console.log('ws close: ', code)
}

ws.onerror = (err) => {
  console.error(err)
}

export default ws

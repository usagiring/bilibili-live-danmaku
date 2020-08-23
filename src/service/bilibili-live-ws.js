const EventEmitter = require('events');
import { inflate } from 'pako';
class Emitter extends EventEmitter { }
const emitter = new Emitter()

const URI = "wss://broadcastlv.chat.bilibili.com:2245/sub";
let ws
let HEART_BEAT_TIMER = null;
let __roomId

export default emitter
export {
  init,
  close,

  parseComment,
  parseGift,
  parseRoomInfo,
  parseInteractWord
}

function close() {
  if (!ws) return
  ws.close();
}

function init(options) {
  console.log(ws && ws.readyState)

  if (ws && (ws.readyState === 1 || ws.readyState === 0)) return


  const { uid = 0, roomId } = options

  __roomId = roomId
  if (!roomId) throw new Error('roomId is null')

  const authParams = {
    uid,
    roomid: roomId,
    protover: 2,
    platform: "web",
    clientver: "1.5.15"
  };

  return new Promise((resolve, reject) => {
    ws = new WebSocket(URI);
    ws.binaryType = "arraybuffer";

    ws.onopen = function () {
      const data = JSON.stringify(authParams);
      const byte = convertToArrayBuffer(data, 7);
      ws.send(byte);
      resolve(emitter)
    };

    ws.onmessage = function (evt) {
      const result = convertToObject(evt.data);

      if (result.op === 3) {
        // {
        //   body: { count: 1 },
        //   headerLen: 16,
        //   op: 3,
        //   packetLen: 20,
        //   seq: 1,
        //   ver: 1
        // }
        emitter.emit('ninki', result.body)
      }
      if (Array.isArray(result.body)) {
        result.body.forEach(function (item) {
          emitter.emit('message', item)
        });
      }

      if (result.op === 8) {
        heartBeat();
      }
    };

    ws.onclose = function () {
      console.log('close')
    };

    ws.onerror = function (err) {
      console.error('error', err)
    };
  })

  function heartBeat() {
    clearInterval(HEART_BEAT_TIMER);
    HEART_BEAT_TIMER = setInterval(() => {
      // TODO 报错重连
      ws.send(convertToArrayBuffer({}, 2));
    }, 30000);
  }
}


const wsBinaryHeaderList = [
  {
    name: "Header Length",
    key: "headerLen",
    bytes: 2,
    offset: 4,
    value: 16
  },
  {
    name: "Protocol Version",
    key: "ver",
    bytes: 2,
    offset: 6,
    value: 1
  },
  {
    name: "Operation",
    key: "op",
    bytes: 4,
    offset: 8,
    value: 1
  },
  {
    name: "Sequence Id",
    key: "seq",
    bytes: 4,
    offset: 12,
    value: 1
  }
];

function stringToByte(str) {
  var bytes = [];
  var len, c;
  len = str.length;
  for (var i = 0; i < len; i++) {
    c = str.charCodeAt(i);
    if (c >= 0x010000 && c <= 0x10ffff) {
      bytes.push(((c >> 18) & 0x07) | 0xf0);
      bytes.push(((c >> 12) & 0x3f) | 0x80);
      bytes.push(((c >> 6) & 0x3f) | 0x80);
      bytes.push((c & 0x3f) | 0x80);
    } else if (c >= 0x000800 && c <= 0x00ffff) {
      bytes.push(((c >> 12) & 0x0f) | 0xe0);
      bytes.push(((c >> 6) & 0x3f) | 0x80);
      bytes.push((c & 0x3f) | 0x80);
    } else if (c >= 0x000080 && c <= 0x0007ff) {
      bytes.push(((c >> 6) & 0x1f) | 0xc0);
      bytes.push((c & 0x3f) | 0x80);
    } else {
      bytes.push(c & 0xff);
    }
  }
  return bytes;
}

function convertToObject(arraybuffer) {
  let dataview = new DataView(arraybuffer);
  let output = {
    body: []
  };
  output.packetLen = dataview.getInt32(0);

  wsBinaryHeaderList.forEach(function (item) {
    4 === item.bytes
      ? (output[item.key] = dataview.getInt32(item.offset))
      : 2 === item.bytes && (output[item.key] = dataview.getInt16(item.offset));
  });

  output.packetLen < arraybuffer.byteLength &&
    convertToObject(arraybuffer.slice(0, output.packetLen));

  let decoder = getDecoder();

  if (output.op && 5 === output.op) {
    for (
      let i = 0, o = output.packetLen, u = "", c = "";
      i < arraybuffer.byteLength;
      i += o
    ) {
      o = dataview.getInt32(i);
      u = dataview.getInt16(i + 4);
      try {
        if (output.ver === 2) {
          const l = arraybuffer.slice(i + u, i + o);
          const f = inflate(l);
          c = convertToObject(f.buffer).body;
        } else {
          c = JSON.parse(decoder.decode(arraybuffer.slice(i + u, i + o)));
        }
        c && output.body.push(c);
      } catch (t) {
        console.error(
          "decode body error:",
          new Uint8Array(arraybuffer),
          output,
          t
        );
      }
    }
  } else {
    // 人气值
    output.op &&
      3 === output.op &&
      (output.body = {
        count: dataview.getInt32(16)
      });
  }
  return output;
}

function convertToArrayBuffer(data, t) {
  var encoder = getEncoder();
  var buffer = new ArrayBuffer(16);
  var dataview = new DataView(buffer, 0);
  var encode = encoder.encode(data);

  return (
    dataview.setInt32(0, 16 + encode.byteLength),
    (wsBinaryHeaderList[2].value = t),
    wsBinaryHeaderList.forEach(function (e) {
      4 === e.bytes
        ? dataview.setInt32(e.offset, e.value)
        : 2 === e.bytes && dataview.setInt16(e.offset, e.value);
    }),
    mergeArrayBuffer(buffer, encode)
  );
}

function mergeArrayBuffer(e, t) {
  const n = new Uint8Array(e);
  const i = new Uint8Array(t);
  const r = new Uint8Array(n.byteLength + i.byteLength);
  r.set(n, 0);
  r.set(i, n.byteLength);
  return r.buffer;
}

function getDecoder() {
  return window.TextDecoder
    ? new window.TextDecoder()
    : {
      decode: function (e) {
        return decodeURIComponent(
          window.escape(String.fromCharCode.apply(String, new Uint8Array(e)))
        );
      }
    };
}

function getEncoder() {
  return window.TextEncoder
    ? new window.TextEncoder()
    : {
      encode: function (e) {
        for (
          var t = new ArrayBuffer(e.length),
          n = new Uint8Array(t),
          i = 0,
          r = e.length;
          i < r;
          i++
        ) {
          n[i] = e.charCodeAt(i);
        }
        return t;
      }
    };
}

function parseComment(msg) {
  if (msg.cmd !== "DANMU_MSG") return
  const [uid, name, isAdmin] = msg.info[2];
  const [medalLevel, medalName] = msg.info[3]
  return {
    roomId: __roomId,
    sendAt: msg.info[0][4],
    uid,
    name,
    isAdmin,
    guard: msg.info[7],
    medalLevel,
    medalName,
    comment: msg.info[1]
  }
}

function parseInteractWord(msg) {
  if (msg.cmd !== "INTERACT_WORD") return
  const { identities, msg_type: msgType, roomid: roomId, score, timestamp, uid, uname, uname_color: unameColor } = msg.data
  return {
    identities,
    roomId,
    score,
    msgType, // 1 进入直播间 2 关注直播间
    timestamp,
    uid,
    uname,
    unameColor
  }
}

const RATE = 1000

function parseGift(msg) {
  if (msg.cmd === 'SUPER_CHAT_MESSAGE_JPN') {
    const {
      uid,
      price,
      message,
      message_jpn,
      time,
      start_time,
      end_time,
      gift,
      user_info,
    } = msg.data
    const {
      uname,
      face,
      guard_level
    } = user_info
    const {
      num,
      gift_id,
      gift_name
    } = gift
    return {
      // user
      uid,
      name: uname,
      avatar: face,
      guardLevel: guard_level,

      // gift
      price: price,
      giftId: gift_id,
      giftName: gift_name,
      giftNumber: num,

      // sc
      type: 'superChat',
      comment: message,
      commentJPN: message_jpn,
      time,
      startTime: start_time,
      endTime: end_time,
    }
  }
  // if (msg.cmd === 'COMBO_SEND') {
  //   const {
  //     uid,
  //     uname,
  //     total_num,
  //     gift_id,
  //     gift_name,
  //     // guard_level,
  //     batch_combo_id
  //   } = msg.data
  //   return {
  //     uid,
  //     name: uname,
  //     // face,
  //     // guardLevel: guard_level,

  //     batchComboId: batch_combo_id,

  //     giftId: gift_id,
  //     giftName: gift_name,
  //     giftNumber: total_num,

  //     type: 'giftCombo',
  //   }
  // }

  if (msg.cmd === 'GUARD_BUY') {
    const {
      uid,
      username,
      guard_level,
      num,
      price,
      gift_id,
      gift_name
    } = msg.data

    return {
      uid,
      name: username,
      // face,
      guardLevel: guard_level,

      price: price / RATE, // 单价
      giftId: gift_id,
      giftName: gift_name,
      giftNumber: num,

      type: 'gift',
    }
  }

  if (msg.cmd === 'SEND_GIFT') {
    const {
      uid,
      num,
      price,
      guard_level,
      giftId,
      coin_type,
      uname,
      face,
      giftName,
      batch_combo_id
    } = msg.data
    return {
      uid,
      name: uname,
      avatar: face,
      guardLevel: guard_level,

      batchComboId: batch_combo_id,
      coinType: coin_type,
      price: price / RATE, // 单价
      giftId: giftId,
      giftName: giftName,
      giftNumber: num,

      type: 'gift',
    }
  }
}

function parseRoomInfo(msg) {
  if (msg.cmd !== "ROOM_REAL_TIME_MESSAGE_UPDATE") return
  const { fans, fans_club: fansClub, room_id: roomId } = msg.data
  return { fans, fansClub, roomId }
}

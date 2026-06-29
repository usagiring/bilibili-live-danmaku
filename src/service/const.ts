export const DEFAULT_FACE = 'https://static.hdslb.com/images/member/noface.gif'

export const GUARD_ICON_1 = 'https://i0.hdslb.com/bfs/activity-plat/static/20200716/1d0c5a1b042efb59f46d4ba1286c6727/icon-guard1.png'
export const GUARD_ICON_2 = 'https://i0.hdslb.com/bfs/activity-plat/static/20200716/1d0c5a1b042efb59f46d4ba1286c6727/icon-guard2.png'
export const GUARD_ICON_3 = 'https://i0.hdslb.com/bfs/activity-plat/static/20200716/1d0c5a1b042efb59f46d4ba1286c6727/icon-guard3.png'

export const GUARD_ICON_MAP = {
  1: GUARD_ICON_1,
  2: GUARD_ICON_2,
  3: GUARD_ICON_3,
}

export const INTERACT_TYPE = {
  1: '进入',
  2: '关注',
  3: '分享',
}

export const QUALITY_MAP = {
  原画: 10000,
  蓝光: 400,
  超清: 250,
  高清: 150,
  流畅: 80,
}

export const COLORS = ['crimson', 'darkorange', 'moccasin', 'forestgreen', 'darkcyan', 'dodgerblue', 'violet']

export const DEFAULT_FONTS = ['inherit', 'initial', 'unset']

export const DEFAULT_COMMON_FONT_FAMILIES = ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy']

export const IPC_CHECK_FOR_UPDATE = 'IPC_CHECK_FOR_UPDATE'
export const IPC_UPDATE_AVAILABLE = 'IPC_UPDATE_AVAILABLE'
export const IPC_DOWNLOAD_UPDATE = 'IPC_DOWNLOAD_UPDATE'
export const IPC_DOWNLOAD_PROGRESS = 'IPC_DOWNLOAD_PROGRESS'
export const IPC_UPDATE_DOWNLOADED = 'IPC_UPDATE_DOWNLOADED'
export const IPC_LIVE_WINDOW_PLAY = 'IPC_LIVE_WINDOW_PLAY'
export const IPC_LIVE_WINDOW_CLOSE = 'IPC_LIVE_WINDOW_CLOSE'
export const IPC_GET_USER_PATH = 'IPC_GET_USER_PATH'
export const IPC_GET_VERSION = 'IPC_GET_VERSION'
export const IPC_GET_EXE_PATH = 'IPC_GET_EXE_PATH'
export const IPC_ENABLE_WEB_CONTENTS = 'IPC_ENABLE_WEB_CONTENTS'
export const IPC_LIVE_WINDOW_ON_TOP = 'IPC_LIVE_WINDOW_ON_TOP'
export const IPC_CHOOSE_DIRECTORY = 'IPC_CHOOSE_DIRECTORY'
export const IPC_SAVE_FILE = 'IPC_SAVE_FILE'
export const IPC_WINDOW_CREATE = 'IPC_WINDOW_CREATE'
export const IPC_WINDOW_CLOSE = 'IPC_WINDOW_CLOSE'
export const IPC_WINDOW_FIND = 'IPC_WINDOW_FIND'
export const IPC_CHILD_WINDOW_ON_TOP = 'IPC_CHILD_WINDOW_ON_TOP'
export const IPC_SHOW_OPEN_DIALOG = 'IPC_SHOW_OPEN_DIALOG'
export const IPC_GET_CURRENT_WINDOW_ID = 'IPC_GET_CURRENT_WINDOW_ID'
export const IPC_WINDOW_ACTION = 'IPC_WINDOW_ACTION'
export const MAX_HISTORY_ROOM = 15

// export const EMOJI = {
//   "[dog]": {
//     "emoticon_id": 208,
//     "emoji": "[dog]",
//     "descript": "[dog]",
//     "url": "http://i0.hdslb.com/bfs/live/4428c84e694fbf4e0ef6c06e958d9352c3582740.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_208",
//     "count": 1
//   },
//   "[哇]": {
//     "emoticon_id": 211,
//     "emoji": "[哇]",
//     "descript": "[哇]",
//     "url": "http://i0.hdslb.com/bfs/live/650c3e22c06edcbca9756365754d38952fc019c3.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_211",
//     "count": 1
//   },
//   "[妙]": {
//     "emoticon_id": 210,
//     "emoji": "[妙]",
//     "descript": "[妙]",
//     "url": "http://i0.hdslb.com/bfs/live/08f735d950a0fba267dda140673c9ab2edf6410d.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_210",
//     "count": 1
//   },
//   "[委屈]": {
//     "emoticon_id": 215,
//     "emoji": "[委屈]",
//     "descript": "[委屈]",
//     "url": "http://i0.hdslb.com/bfs/live/69312e99a00d1db2de34ef2db9220c5686643a3f.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_215",
//     "count": 1
//   },
//   "[手机]": {
//     "emoticon_id": 213,
//     "emoji": "[手机]",
//     "descript": "[手机]",
//     "url": "http://i0.hdslb.com/bfs/live/b159f90431148a973824f596288e7ad6a8db014b.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_213",
//     "count": 1
//   },
//   "[撇嘴]": {
//     "emoticon_id": 214,
//     "emoji": "[撇嘴]",
//     "descript": "[撇嘴]",
//     "url": "http://i0.hdslb.com/bfs/live/4255ce6ed5d15b60311728a803d03dd9a24366b2.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_214",
//     "count": 1
//   },
//   "[爱]": {
//     "emoticon_id": 212,
//     "emoji": "[爱]",
//     "descript": "[爱]",
//     "url": "http://i0.hdslb.com/bfs/live/1daaa5d284dafaa16c51409447da851ff1ec557f.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_212",
//     "count": 1
//   },
//   "[花]": {
//     "emoticon_id": 209,
//     "emoji": "[花]",
//     "descript": "[花]",
//     "url": "http://i0.hdslb.com/bfs/live/7dd2ef03e13998575e4d8a803c6e12909f94e72b.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_209",
//     "count": 1
//   },
//   "[吃瓜]": {
//     "emoticon_id": 220,
//     "emoji": "[吃瓜]",
//     "descript": "[吃瓜]",
//     "url": "http://i0.hdslb.com/bfs/live/ffb53c252b085d042173379ac724694ce3196194.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_220",
//     "count": 1
//   },
//   "[抓狂]": {
//     "emoticon_id": 216,
//     "emoji": "[抓狂]",
//     "descript": "[抓狂]",
//     "url": "http://i0.hdslb.com/bfs/live/a7feb260bb5b15f97d7119b444fc698e82516b9f.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_216",
//     "count": 1
//   },
//   "[捂脸]": {
//     "emoticon_id": 222,
//     "emoji": "[捂脸]",
//     "descript": "[捂脸]",
//     "url": "http://i0.hdslb.com/bfs/live/e6073c6849f735ae6cb7af3a20ff7dcec962b4c5.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_222",
//     "count": 1
//   },
//   "[比心]": {
//     "emoticon_id": 217,
//     "emoji": "[比心]",
//     "descript": "[比心]",
//     "url": "http://i0.hdslb.com/bfs/live/4e029593562283f00d39b99e0557878c4199c71d.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_217",
//     "count": 1
//   },
//   "[滑稽]": {
//     "emoticon_id": 219,
//     "emoji": "[滑稽]",
//     "descript": "[滑稽]",
//     "url": "http://i0.hdslb.com/bfs/live/8624fd172037573c8600b2597e3731ef0e5ea983.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_219",
//     "count": 1
//   },
//   "[笑哭]": {
//     "emoticon_id": 221,
//     "emoji": "[笑哭]",
//     "descript": "[笑哭]",
//     "url": "http://i0.hdslb.com/bfs/live/c5436c6806c32b28d471bb23d42f0f8f164a187a.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_221",
//     "count": 1
//   },
//   "[赞]": {
//     "emoticon_id": 218,
//     "emoji": "[赞]",
//     "descript": "[赞]",
//     "url": "http://i0.hdslb.com/bfs/live/2dd666d3651bafe8683acf770b7f4163a5f49809.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_218",
//     "count": 1
//   },
//   "[偷笑]": {
//     "emoticon_id": 224,
//     "emoji": "[偷笑]",
//     "descript": "[偷笑]",
//     "url": "http://i0.hdslb.com/bfs/live/e2ba16f947a23179cdc00420b71cc1d627d8ae25.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_224",
//     "count": 1
//   },
//   "[傲娇]": {
//     "emoticon_id": 227,
//     "emoji": "[傲娇]",
//     "descript": "[傲娇]",
//     "url": "http://i0.hdslb.com/bfs/live/b5b44f099059a1bafb2c2722cfe9a6f62c1dc531.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_227",
//     "count": 1
//   },
//   "[吓]": {
//     "emoticon_id": 229,
//     "emoji": "[吓]",
//     "descript": "[吓]",
//     "url": "http://i0.hdslb.com/bfs/live/c6bed64ffb78c97c93a83fbd22f6fdf951400f31.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_229",
//     "count": 1
//   },
//   "[喝彩]": {
//     "emoticon_id": 223,
//     "emoji": "[喝彩]",
//     "descript": "[喝彩]",
//     "url": "http://i0.hdslb.com/bfs/live/b51824125d09923a4ca064f0c0b49fc97d3fab79.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_223",
//     "count": 1
//   },
//   "[大笑]": {
//     "emoticon_id": 225,
//     "emoji": "[大笑]",
//     "descript": "[大笑]",
//     "url": "http://i0.hdslb.com/bfs/live/e2589d086df0db8a7b5ca2b1273c02d31d4433d4.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_225",
//     "count": 1
//   },
//   "[惊喜]": {
//     "emoticon_id": 226,
//     "emoji": "[惊喜]",
//     "descript": "[惊喜]",
//     "url": "http://i0.hdslb.com/bfs/live/9c75761c5b6e1ff59b29577deb8e6ad996b86bd7.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_226",
//     "count": 1
//   },
//   "[疼]": {
//     "emoticon_id": 228,
//     "emoji": "[疼]",
//     "descript": "[疼]",
//     "url": "http://i0.hdslb.com/bfs/live/492b10d03545b7863919033db7d1ae3ef342df2f.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_228",
//     "count": 1
//   },
//   "[阴险]": {
//     "emoticon_id": 230,
//     "emoji": "[阴险]",
//     "descript": "[阴险]",
//     "url": "http://i0.hdslb.com/bfs/live/a4df45c035b0ca0c58f162b5fb5058cf273d0d09.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_230",
//     "count": 1
//   },
//   "[出窍]": {
//     "emoticon_id": 238,
//     "emoji": "[出窍]",
//     "descript": "[出窍]",
//     "url": "http://i0.hdslb.com/bfs/live/bb8e95fa54512ffea07023ea4f2abee4a163e7a0.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_238",
//     "count": 1
//   },
//   "[嘘]": {
//     "emoticon_id": 234,
//     "emoji": "[嘘]",
//     "descript": "[嘘]",
//     "url": "http://i0.hdslb.com/bfs/live/b6226219384befa5da1d437cb2ff4ba06c303844.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_234",
//     "count": 1
//   },
//   "[囧]": {
//     "emoticon_id": 236,
//     "emoji": "[囧]",
//     "descript": "[囧]",
//     "url": "http://i0.hdslb.com/bfs/live/204413d3cf330e122230dcc99d29056f2a60e6f2.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_236",
//     "count": 1
//   },
//   "[奸笑]": {
//     "emoticon_id": 235,
//     "emoji": "[奸笑]",
//     "descript": "[奸笑]",
//     "url": "http://i0.hdslb.com/bfs/live/5935e6a4103d024955f749d428311f39e120a58a.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_235",
//     "count": 1
//   },
//   "[惊讶]": {
//     "emoticon_id": 232,
//     "emoji": "[惊讶]",
//     "descript": "[惊讶]",
//     "url": "http://i0.hdslb.com/bfs/live/bc26f29f62340091737c82109b8b91f32e6675ad.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_232",
//     "count": 1
//   },
//   "[捂脸2]": {
//     "emoticon_id": 237,
//     "emoji": "[捂脸2]",
//     "descript": "[捂脸2]",
//     "url": "http://i0.hdslb.com/bfs/live/a2ad0cc7e390a303f6d243821479452d31902a5f.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_237",
//     "count": 1
//   },
//   "[生病]": {
//     "emoticon_id": 233,
//     "emoji": "[生病]",
//     "descript": "[生病]",
//     "url": "http://i0.hdslb.com/bfs/live/84c92239591e5ece0f986c75a39050a5c61c803c.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_233",
//     "count": 1
//   },
//   "[OK]": {
//     "emoticon_id": 244,
//     "emoji": "[OK]",
//     "descript": "[OK]",
//     "url": "http://i0.hdslb.com/bfs/live/86268b09e35fbe4215815a28ef3cf25ec71c124f.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_244",
//     "count": 1
//   },
//   "[冷]": {
//     "emoticon_id": 243,
//     "emoji": "[冷]",
//     "descript": "[冷]",
//     "url": "http://i0.hdslb.com/bfs/live/b804118a1bdb8f3bec67d9b108d5ade6e3aa93a9.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_243",
//     "count": 1
//   },
//   "[吐了啊]": {
//     "emoticon_id": 239,
//     "emoji": "[吐了啊]",
//     "descript": "[吐了啊]",
//     "url": "http://i0.hdslb.com/bfs/live/2b6b4cc33be42c3257dc1f6ef3a39d666b6b4b1a.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_239",
//     "count": 1
//   },
//   "[微笑]": {
//     "emoticon_id": 245,
//     "emoji": "[微笑]",
//     "descript": "[微笑]",
//     "url": "http://i0.hdslb.com/bfs/live/f605dd8229fa0115e57d2f16cb019da28545452b.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_245",
//     "count": 1
//   },
//   "[调皮]": {
//     "emoticon_id": 241,
//     "emoji": "[调皮]",
//     "descript": "[调皮]",
//     "url": "http://i0.hdslb.com/bfs/live/84fe12ecde5d3875e1090d83ac9027cb7d7fba9f.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_241",
//     "count": 1
//   },
//   "[酸]": {
//     "emoticon_id": 242,
//     "emoji": "[酸]",
//     "descript": "[酸]",
//     "url": "http://i0.hdslb.com/bfs/live/98fd92c6115b0d305f544b209c78ec322e4bb4ff.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_242",
//     "count": 1
//   },
//   "[鼻子]": {
//     "emoticon_id": 240,
//     "emoji": "[鼻子]",
//     "descript": "[鼻子]",
//     "url": "http://i0.hdslb.com/bfs/live/f4ed20a70d0cb85a22c0c59c628aedfe30566b37.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_240",
//     "count": 1
//   },
//   "[一般]": {
//     "emoticon_id": 250,
//     "emoji": "[一般]",
//     "descript": "[一般]",
//     "url": "http://i0.hdslb.com/bfs/live/8d436de0c3701d87e4ca9c1be01c01b199ac198e.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_250",
//     "count": 1
//   },
//   "[嫌弃]": {
//     "emoticon_id": 251,
//     "emoji": "[嫌弃]",
//     "descript": "[嫌弃]",
//     "url": "http://i0.hdslb.com/bfs/live/c409425ba1ad2c6534f0df7de350ba83a9c949e5.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_251",
//     "count": 1
//   },
//   "[无语]": {
//     "emoticon_id": 252,
//     "emoji": "[无语]",
//     "descript": "[无语]",
//     "url": "http://i0.hdslb.com/bfs/live/4781a77be9c8f0d4658274eb4e3012c47a159f23.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_252",
//     "count": 1
//   },
//   "[笑]": {
//     "emoticon_id": 249,
//     "emoji": "[笑]",
//     "descript": "[笑]",
//     "url": "http://i0.hdslb.com/bfs/live/a91a27f83c38b5576f4cd08d4e11a2880de78918.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_249",
//     "count": 1
//   },
//   "[藏狐]": {
//     "emoticon_id": 246,
//     "emoji": "[藏狐]",
//     "descript": "[藏狐]",
//     "url": "http://i0.hdslb.com/bfs/live/05ef7849e7313e9c32887df922613a7c1ad27f12.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_246",
//     "count": 1
//   },
//   "[防护]": {
//     "emoticon_id": 248,
//     "emoji": "[防护]",
//     "descript": "[防护]",
//     "url": "http://i0.hdslb.com/bfs/live/17435e60dcc28ce306762103a2a646046ff10b0a.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_248",
//     "count": 1
//   },
//   "[龇牙]": {
//     "emoticon_id": 247,
//     "emoji": "[龇牙]",
//     "descript": "[龇牙]",
//     "url": "http://i0.hdslb.com/bfs/live/8b99266ea7b9e86cf9d25c3d1151d80c5ba5c9a1.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_247",
//     "count": 1
//   },
//   "[OH]": {
//     "emoticon_id": 259,
//     "emoji": "[OH]",
//     "descript": "[OH]",
//     "url": "http://i0.hdslb.com/bfs/live/0d5123cddf389302df6f605087189fd10919dc3c.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_259",
//     "count": 1
//   },
//   "[亲亲]": {
//     "emoticon_id": 256,
//     "emoji": "[亲亲]",
//     "descript": "[亲亲]",
//     "url": "http://i0.hdslb.com/bfs/live/10662d9c0d6ddb3203ecf50e77788b959d4d1928.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_256",
//     "count": 1
//   },
//   "[可怜]": {
//     "emoticon_id": 254,
//     "emoji": "[可怜]",
//     "descript": "[可怜]",
//     "url": "http://i0.hdslb.com/bfs/live/8e88e6a137463703e96d4f27629f878efa323456.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_254",
//     "count": 1
//   },
//   "[哈欠]": {
//     "emoticon_id": 253,
//     "emoji": "[哈欠]",
//     "descript": "[哈欠]",
//     "url": "http://i0.hdslb.com/bfs/live/6e496946725cd66e7ff1b53021bf1cc0fc240288.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_253",
//     "count": 1
//   },
//   "[歪嘴笑]": {
//     "emoticon_id": 255,
//     "emoji": "[歪嘴笑]",
//     "descript": "[歪嘴笑]",
//     "url": "http://i0.hdslb.com/bfs/live/bea1f0497888f3e9056d3ce14ba452885a485c02.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_255",
//     "count": 1
//   },
//   "[波吉]": {
//     "emoticon_id": 258,
//     "emoji": "[波吉]",
//     "descript": "[波吉]",
//     "url": "http://i0.hdslb.com/bfs/live/57dee478868ed9f1ce3cf25a36bc50bde489c404.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_258",
//     "count": 1
//   },
//   "[问号]": {
//     "emoticon_id": 257,
//     "emoji": "[问号]",
//     "descript": "[问号]",
//     "url": "http://i0.hdslb.com/bfs/live/a0c456b6d9e3187399327828a9783901323bfdb5.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_257",
//     "count": 1
//   },
//   "[再见]": {
//     "emoticon_id": 260,
//     "emoji": "[再见]",
//     "descript": "[再见]",
//     "url": "http://i0.hdslb.com/bfs/live/f408e2af700adcc2baeca15510ef620bed8d4c43.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_260",
//     "count": 1
//   },
//   "[呆]": {
//     "emoticon_id": 264,
//     "emoji": "[呆]",
//     "descript": "[呆]",
//     "url": "http://i0.hdslb.com/bfs/live/179c7e2d232cd74f30b672e12fc728f8f62be9ec.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_264",
//     "count": 1
//   },
//   "[大哭]": {
//     "emoticon_id": 263,
//     "emoji": "[大哭]",
//     "descript": "[大哭]",
//     "url": "http://i0.hdslb.com/bfs/live/816402551e6ce30d08b37a917f76dea8851fe529.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_263",
//     "count": 1
//   },
//   "[流汗]": {
//     "emoticon_id": 265,
//     "emoji": "[流汗]",
//     "descript": "[流汗]",
//     "url": "http://i0.hdslb.com/bfs/live/b00e2e02904096377061ec5f93bf0dd3321f1964.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_265",
//     "count": 1
//   },
//   "[生气]": {
//     "emoticon_id": 266,
//     "emoji": "[生气]",
//     "descript": "[生气]",
//     "url": "http://i0.hdslb.com/bfs/live/2c69dad2e5c0f72f01b92746bc9d148aee1993b2.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_266",
//     "count": 1
//   },
//   "[白眼]": {
//     "emoticon_id": 261,
//     "emoji": "[白眼]",
//     "descript": "[白眼]",
//     "url": "http://i0.hdslb.com/bfs/live/7fa907ae85fa6327a0466e123aee1ac32d7c85f7.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_261",
//     "count": 1
//   },
//   "[鼓掌]": {
//     "emoticon_id": 262,
//     "emoji": "[鼓掌]",
//     "descript": "[鼓掌]",
//     "url": "http://i0.hdslb.com/bfs/live/d581d0bc30c8f9712b46ec02303579840c72c42d.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_262",
//     "count": 1
//   },
//   "[doge2]": {
//     "emoticon_id": 270,
//     "emoji": "[doge2]",
//     "descript": "[doge2]",
//     "url": "http://i0.hdslb.com/bfs/live/f547cc853cf43e70f1e39095d9b3b5ac1bf70a8d.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_270",
//     "count": 1
//   },
//   "[加油]": {
//     "emoticon_id": 267,
//     "emoji": "[加油]",
//     "descript": "[加油]",
//     "url": "http://i0.hdslb.com/bfs/live/fbc3c8bc4152a65bbf4a9fd5a5d27710fbff2119.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_267",
//     "count": 1
//   },
//   "[害羞]": {
//     "emoticon_id": 268,
//     "emoji": "[害羞]",
//     "descript": "[害羞]",
//     "url": "http://i0.hdslb.com/bfs/live/d8ce9b05c0e40cec61a15ba1979c8517edd270bf.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_268",
//     "count": 1
//   },
//   "[瓜子]": {
//     "emoticon_id": 272,
//     "emoji": "[瓜子]",
//     "descript": "[瓜子]",
//     "url": "http://i0.hdslb.com/bfs/live/fd35718ac5a278fd05fe5287ebd41de40a59259d.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_272",
//     "count": 1
//   },
//   "[虎年]": {
//     "emoticon_id": 269,
//     "emoji": "[虎年]",
//     "descript": "[虎年]",
//     "url": "http://i0.hdslb.com/bfs/live/a51af0d7d9e60ce24f139c468a3853f9ba9bb184.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_269",
//     "count": 1
//   },
//   "[金钱豹]": {
//     "emoticon_id": 271,
//     "emoji": "[金钱豹]",
//     "descript": "[金钱豹]",
//     "url": "http://i0.hdslb.com/bfs/live/b6e8131897a9a718ee280f2510bfa92f1d84429b.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_271",
//     "count": 1
//   },
//   "[三星堆]": {
//     "emoticon_id": 279,
//     "emoji": "[三星堆]",
//     "descript": "[三星堆]",
//     "url": "http://i0.hdslb.com/bfs/live/0a1ab3f0f2f2e29de35c702ac1ecfec7f90e325d.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_279",
//     "count": 1
//   },
//   "[墨镜]": {
//     "emoticon_id": 273,
//     "emoji": "[墨镜]",
//     "descript": "[墨镜]",
//     "url": "http://i0.hdslb.com/bfs/live/5e01c237642c8b662a69e21b8e0fbe6e7dbc2aa1.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_273",
//     "count": 1
//   },
//   "[抱抱]": {
//     "emoticon_id": 275,
//     "emoji": "[抱抱]",
//     "descript": "[抱抱]",
//     "url": "http://i0.hdslb.com/bfs/live/abddb0b621b389fc8c2322b1cfcf122d8936ba91.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_275",
//     "count": 1
//   },
//   "[摊手]": {
//     "emoticon_id": 277,
//     "emoji": "[摊手]",
//     "descript": "[摊手]",
//     "url": "http://i0.hdslb.com/bfs/live/1e0a2baf088a34d56e2cc226b2de36a5f8d6c926.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_277",
//     "count": 1
//   },
//   "[热]": {
//     "emoticon_id": 278,
//     "emoji": "[热]",
//     "descript": "[热]",
//     "url": "http://i0.hdslb.com/bfs/live/6df760280b17a6cbac8c1874d357298f982ba4cf.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_278",
//     "count": 1
//   },
//   "[跪了]": {
//     "emoticon_id": 276,
//     "emoji": "[跪了]",
//     "descript": "[跪了]",
//     "url": "http://i0.hdslb.com/bfs/live/4f2155b108047d60c1fa9dccdc4d7abba18379a0.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_276",
//     "count": 1
//   },
//   "[难过]": {
//     "emoticon_id": 274,
//     "emoji": "[难过]",
//     "descript": "[难过]",
//     "url": "http://i0.hdslb.com/bfs/live/5776481e380648c0fb3d4ad6173475f69f1ce149.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_274",
//     "count": 1
//   },
//   "[不行]": {
//     "emoticon_id": 284,
//     "emoji": "[不行]",
//     "descript": "[不行]",
//     "url": "http://i0.hdslb.com/bfs/live/607f74ccf5eec7d2b17d91b9bb36be61a5dd196b.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_284",
//     "count": 1
//   },
//   "[保佑]": {
//     "emoticon_id": 287,
//     "emoji": "[保佑]",
//     "descript": "[保佑]",
//     "url": "http://i0.hdslb.com/bfs/live/241b13adb4933e38b7ea6f5204e0648725e76fbf.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_287",
//     "count": 1
//   },
//   "[响指]": {
//     "emoticon_id": 285,
//     "emoji": "[响指]",
//     "descript": "[响指]",
//     "url": "http://i0.hdslb.com/bfs/live/3b2fedf09b0ac79679b5a47f5eb3e8a38e702387.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_285",
//     "count": 1
//   },
//   "[汤圆]": {
//     "emoticon_id": 281,
//     "emoji": "[汤圆]",
//     "descript": "[汤圆]",
//     "url": "http://i0.hdslb.com/bfs/live/23ae12d3a71b9d7a22c8773343969fcbb94b20d0.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_281",
//     "count": 1
//   },
//   "[泼水]": {
//     "emoticon_id": 282,
//     "emoji": "[泼水]",
//     "descript": "[泼水]",
//     "url": "http://i0.hdslb.com/bfs/live/29533893115c4609a4af336f49060ea13173ca78.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_282",
//     "count": 1
//   },
//   "[牛]": {
//     "emoticon_id": 286,
//     "emoji": "[牛]",
//     "descript": "[牛]",
//     "url": "http://i0.hdslb.com/bfs/live/5e61223561203c50340b4c9b41ba7e4b05e48ae2.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_286",
//     "count": 1
//   },
//   "[鬼魂]": {
//     "emoticon_id": 283,
//     "emoji": "[鬼魂]",
//     "descript": "[鬼魂]",
//     "url": "http://i0.hdslb.com/bfs/live/5d86d55ba9a2f99856b523d8311cf75cfdcccdbc.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_283",
//     "count": 1
//   },
//   "[鼠]": {
//     "emoticon_id": 280,
//     "emoji": "[鼠]",
//     "descript": "[鼠]",
//     "url": "http://i0.hdslb.com/bfs/live/98f842994035505c728e32e32045d649e371ecd6.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_280",
//     "count": 1
//   },
//   "[抱拳]": {
//     "emoticon_id": 288,
//     "emoji": "[抱拳]",
//     "descript": "[抱拳]",
//     "url": "http://i0.hdslb.com/bfs/live/3f170894dd08827ee293afcb5a3d2b60aecdb5b1.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_288",
//     "count": 1
//   },
//   "[给力]": {
//     "emoticon_id": 289,
//     "emoji": "[给力]",
//     "descript": "[给力]",
//     "url": "http://i0.hdslb.com/bfs/live/d1ba5f4c54332a21ed2ca0dcecaedd2add587839.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_289",
//     "count": 1
//   },
//   "[耶]": {
//     "emoticon_id": 290,
//     "emoji": "[耶]",
//     "descript": "[耶]",
//     "url": "http://i0.hdslb.com/bfs/live/eb2d84ba623e2335a48f73fb5bef87bcf53c1239.png",
//     "width": 20,
//     "height": 20,
//     "emoticon_unique": "emoji_290",
//     "count": 1
//   }
// }

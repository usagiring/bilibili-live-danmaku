### vue-cli
vue ui

### iview
Switch -> i-switch
Circle -> i-circle
Col -> i-col

元素包裹性
包裹性就是父元素的宽度会收缩到和内部元素宽度一样。

### vue
单文件组件设置body style 需要在生命周期beforecreate时设置（需探究原因）
v-deep 作用于 scope 中更深层的子元素

### vuex-electron
默认使用 electron-store 存储
```
import Store from "electron-store";
const store = new Store({ name: "vuex" });
store.clear();
```

### 关闭windowshadow避免resize产生重影

### production debug: --remote-debugging-port=8315, http://localhost:8315/

### vuex
计算属性需要在storage里初始化才能reactive

###
less other | grep  -v "COMBO_SEND" | grep -v "ONLINE_RANK_COUNT" | grep -v "ENTRY_EFFECT" | grep -v "SUPER_CHAT_MESSAGE_JPN" | grep -v "SUPER_CHAT_MESSAGE" | grep -v "NOTICE_MSG" | grep -v "ONLINE_RANK_V2" | grep -v "ONLINE_RANK_TOP3" | grep -v "HOT_RANK_CHANGED" | grep -v "GUARD_BUY" | grep -v "HOT_RANK_SETTLEMENT" | grep -v "WELCOME_GUARD" | grep -v "ACTIVITY_BANNER_UPDATE_V2" | grep -v "ROOM_BANNER" | grep -v "PK_BATTLE_END" | grep -v "PANEL" | grep -v "PK_BATTLE_SETTLE_V2" | grep -v "PK_BATTLE_START_NEW" | grep -v "USER_TOAST_MSG" | grep -v "PK_BATTLE_PROCESS" | grep -v "WIDGET_BANNER" | grep -v "PK_BATTLE_PRE" | grep -v "ONLINERANK" | grep -v "PK_BATTLE_SETTLE" | grep -v "ROOM_RANK" | grep -v "WELCOME" | grep -v "PK_BATTLE_START" | grep -v "ROOM_BLOCK_MSG" | grep -v "ANCHOR_LOT_CHECKSTATUS" | grep -v "ANCHOR_LOT_START" | grep -v "ANCHOR_LOT_END" | grep -v "ANCHOR_LOT_AWARD" | grep -v "GUARD_ACHIEVEMENT_ROOM" | grep -v "PK_LOTTERY_START" | grep -v "ROOM_CHANGE" | grep -v "ROOM_SKIN_MSG" | grep -v "SPECIAL_GIFT" | grep -v "room_admin_entrance" | grep -v "ROOM_ADMINS" | grep -v "TRADING_SCORE" | grep -v "PK_BATTLE_ENTRANCE" | grep -v "SYS_MSG" | grep -v "MATCH_ROOM_CONF"

{"cmd":"PREPARING","roomid":"22632424","_id":"ovMFjeyeInIFs8yG"}
{"cmd":"LIVE","live_key":"142000930295522209","sub_session_key":"142000930295522209sub_time:1616591278","live_platform":"pc","live_model":0,"roomid":664481,"_id":"stfb6ahOWmAU3kgf"}

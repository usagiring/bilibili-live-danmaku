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
less other | grep  -v "COMBO_SEND" | grep -v "ONLINE_RANK_COUNT" | grep -v "ENTRY_EFFECT" | grep -v "SUPER_CHAT_MESSAGE_JPN" | grep -v "SUPER_CHAT_MESSAGE" | grep -v "NOTICE_MSG" | grep -v "ONLINE_RANK_V2" | grep -v "ONLINE_RANK_TOP3" | grep -v "HOT_RANK_CHANGED" | grep -v "GUARD_BUY" | grep -v "HOT_RANK_SETTLEMENT" | grep -v "WELCOME_GUARD" | grep -v "ACTIVITY_BANNER_UPDATE_V2" | grep -v "ROOM_BANNER" | grep -v "PK_BATTLE_END" | grep -v "PANEL" | grep -v "PK_BATTLE_SETTLE_V2" | grep -v "PK_BATTLE_START_NEW" | grep -v "USER_TOAST_MSG" | grep -v "PK_BATTLE_PROCESS" | grep -v "WIDGET_BANNER" | grep -v "PK_BATTLE_PRE" | grep -v "ONLINERANK" | grep -v "PK_BATTLE_SETTLE" | grep -v "ROOM_RANK" | grep -v "WELCOME" | grep -v "PK_BATTLE_START" | grep -v "ROOM_BLOCK_MSG" | grep -v "ANCHOR_LOT_CHECKSTATUS" | grep -v "ANCHOR_LOT_START" | grep -v "ANCHOR_LOT_END" | grep -v "ANCHOR_LOT_AWARD" | grep -v "GUARD_ACHIEVEMENT_ROOM" | grep -v "PK_LOTTERY_START" | grep -v "ROOM_CHANGE" | grep -v "ROOM_SKIN_MSG" | grep -v "SPECIAL_GIFT" | grep -v "room_admin_entrance" | grep -v "ROOM_ADMINS" | grep -v "TRADING_SCORE" | grep -v "PK_BATTLE_ENTRANCE" | grep -v "SYS_MSG" | grep -v "MATCH_ROOM_CONF" | grep -v "WARNING" | grep -v "SUPER_CHAT_ENTRANCE" | grep -v "CUT_OFF" | grep -v "PREPARING" | grep -v "LIVE"

{"cmd":"PREPARING","roomid":"22632424","_id":"ovMFjeyeInIFs8yG"}
{"cmd":"LIVE","live_key":"142000930295522209","sub_session_key":"142000930295522209sub_time:1616591278","live_platform":"pc","live_model":0,"roomid":664481,"_id":"stfb6ahOWmAU3kgf"}

{
    "cmd":"ANCHOR_LOT_START",
    "data":{
        "asset_icon":"https://i0.hdslb.com/bfs/live/992c2ccf88d3ea99620fb3a75e672e0abe850e9c.png",
        "award_image":"",
        "award_name":"优菈一只或1000元红包",
        "award_num":1,
        "cur_gift_num":0,
        "current_time":1621350047,
        "danmu":"好耶！",
        "gift_id":30572,
        "gift_name":"大闸蟹",
        "gift_num":1,
        "gift_price":2000,
        "goaway_time":180,
        "goods_id":15,
        "id":1217192,
        "is_broadcast":1,
        "join_type":1,
        "lot_status":0,
        "max_time":600,
        "require_text":"无",
        "require_type":0,
        "require_value":0,
        "room_id":732602,
        "send_gift_ensure":0,
        "show_panel":1,
        "status":1,
        "time":599,
        "url":"https://live.bilibili.com/p/html/live-lottery/anchor-join.html?is_live_half_webview=1&amp;hybrid_biz=live-lottery-anchor&amp;hybrid_half_ui=1,5,100p,100p,000000,0,30,0,0,1;2,5,100p,100p,000000,0,30,0,0,1;3,5,100p,100p,000000,0,30,0,0,1;4,5,100p,100p,000000,0,30,0,0,1;5,5,100p,100p,000000,0,30,0,0,1;6,5,100p,100p,000000,0,30,0,0,1;7,5,100p,100p,000000,0,30,0,0,1;8,5,100p,100p,000000,0,30,0,0,1",
        "web_url":"https://live.bilibili.com/p/html/live-lottery/anchor-join.html"
    },
    "_id":"rzPhXsmhGyyZhvTq"
}

{
    "cmd":"ANCHOR_LOT_AWARD",
    "data":{
        "award_image":"",
        "award_name":"优菈一只或1000元红包",
        "award_num":1,
        "award_users":[
            {
                "uid":272853351,
                "uname":"天之悠净",
                "face":"http://i0.hdslb.com/bfs/face/3084517bd2f7438cb2706f1c959ba3d4b750cdaf.jpg",
                "level":2,
                "color":9868950
            }
        ],
        "id":1217574,
        "lot_status":2,
        "url":"https://live.bilibili.com/p/html/live-lottery/anchor-join.html?is_live_half_webview=1&amp;hybrid_biz=live-lottery-anchor&amp;hybrid_half_ui=1,5,100p,100p,000000,0,30,0,0,1;2,5,100p,100p,000000,0,30,0,0,1;3,5,100p,100p,000000,0,30,0,0,1;4,5,100p,100p,000000,0,30,0,0,1;5,5,100p,100p,000000,0,30,0,0,1;6,5,100p,100p,000000,0,30,0,0,1;7,5,100p,100p,000000,0,30,0,0,1;8,5,100p,100p,000000,0,30,0,0,1",
        "web_url":"https://live.bilibili.com/p/html/live-lottery/anchor-join.html"
    },
    "_id":"PtQC7AP1mPQ01fHz"
}

{"cmd":"ANCHOR_LOT_END","data":{"id":1217574},"_id":"M0zRZUq3C7wKsPGZ"}
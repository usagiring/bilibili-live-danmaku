# B站直播间弹幕信息分析

### 人气值 op: 3
```
{
  count: 
}
```

### cmd: DANMU_MSG
弹幕信息
包含用户名，用户id，带的牌子以及等级，发送时间，舰队信息，是否管理员，带的头衔 等

```
const [uid, name, isAdmin] = msg.info[2];
const [medalLevel, medalName] = msg.info[3]
const guard = msg.info[7]
return {
  sendAt: msg.info[0][4],
  uid,
  name,
  medalLevel,
  medalName,
  isAdmin,
  guard,
  comment: msg.info[1]
}
```

### cmd: INTERACT_WORD
最近新加的，进入直播间信息
经测试约十分钟再次进入会发送信息。安卓6.6.0测试即使一直在线，过十分钟再次进入也会发。

```
const { identities, msg_type: msgType, roomid: roomId, score, timestamp, uid, uname, uname_color: unameColor } = msg.data
return {
  identities, // array, [6] 舰长？ [7] 提督？
  roomId,
  score,
  msgType,
  timestamp,
  uid,
  uname,
  unameColor
}
```

### cmd: ROOM_REAL_TIME_MESSAGE_UPDATE
关注数，粉丝数
```
{
  fans: 
  fans_club
  red_notice
  roomid
}
```

### cmd: GUARD_BUY
加入舰队
```
{
  end_time
  gift_id
  gift_name
  guard_level, // 1 总督 2 提督 3 舰长
  num
  price
  start_time
  uid
  username
}
```

### cmd: SUPER_CHAT_MESSAGE
sc
```
{
  message:
  message_font_color
  message_trans
  price // 人民币
  rate // 金瓜子倍率？
  start_time
  time // 持续时间？
  token
  trans_mark
  uid
  is_ranked
  user_info // 发送人信息
  background_color
  background_price_color

}
```

### cmd: SUPER_CHAT_MESSAGE_JPN

### cmd: COMBO_SEND

### cmd: COMBO_END
```
{
  action: '投喂'
  batch_combo_num
  combo_num
  combo_total_coin // 总价值？
  end_time
  gift_id
  gift_name
  gitf_num
  price:
  r_uname // 目标用户
  ruid // 目标用户
  uid
  uname
  start_time

}
```

### cmd: SEND_GIFT
```
{
  action: "投喂"
  biz_source: "live"
  combo_total_coin: 0
  giftId: 1
  giftName: "辣条"
  giftType: 5
  gold: 0
  guard_level: 0
  price: 100
  num
  coin_type: "silver"
}
```

### cmd: SPECIAL_GIFT
?
```
{
  39: {
    action: end
    id: 
  }
}
```

### cmd: HOUR_RANK_AWARDS

### cmd: ANCHOR_LOT_START
抽奖开始

### cmd: ANCHOR_LOT_CHECKSTATUS


"background_color":"#EDF5FF","background_icon":"","background_price_color":"#7497CD","background_bottom_color":"#2A60B2"
"background_color":"#DBFFFD","background_icon":"","background_price_color":"#7DA4BD","background_bottom_color":"#427D9E",
"background_color":"#FFF1C5","background_icon":"","background_price_color":"#ECCF75","background_bottom_color":"#E2B52B",

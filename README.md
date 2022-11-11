# bilibili-danmaku

这是一个桌面端哔哩哔哩的直播弹幕应用（electron-vue）

目前支持直播间数据统计、多样化自定义弹幕展示、弹幕投票、自动语音/文字回复等功能

### 下载
https://github.com/usagiring/bilibili-live-danmaku/releases

### 示例
弹幕窗及设置页面：
![intro1](https://github.com/usagiring/bilibili-live-danmaku/blob/master/static/intro1.png)

弹幕投票：
![intro2](https://github.com/usagiring/bilibili-live-danmaku/blob/master/static/intro2.png)

数据统计：
![intro3](https://github.com/usagiring/bilibili-live-danmaku/blob/master/static/intro3.png)

自动回复：
![intro4](https://github.com/usagiring/bilibili-live-danmaku/blob/master/static/intro4.png)

观看直播：
![intro5](https://github.com/usagiring/bilibili-live-danmaku/blob/master/static/intro5.png)

### 说明
- 本应用数据基于本地收集到的数据，未被应用统计到的数据不进行统计。
- 十分内互动人数，由进入直播间、发送弹幕、送礼组成。

### for developer

架构图：
![er](https://github.com/usagiring/bilibili-live-danmaku/blob/master/static/er.png)

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build
```
# bilibili-danmaku

这是一个桌面端哔哩哔哩的直播弹幕应用（electron-vue）

目前支持直播间数据统计、弹幕展示、弹幕投票等功能

### 下载
https://github.com/hling51325/bilibili-live-danmaku/releases

### 示例
弹幕窗及设置页面：
![introB](https://raw.githubusercontent.com/hling51325/hling51325.github.io/master/static/img/bili-danmaku-introB.png)

弹幕投票：
![introA](https://raw.githubusercontent.com/hling51325/hling51325.github.io/master/static/img/bili-danmaku-introA.png)

数据统计：
![introC](https://raw.githubusercontent.com/hling51325/hling51325.github.io/master/static/img/bili-danmaku-introC.png)

### 说明
- 本应用数据基于本地收集到的数据，未被应用统计到的数据不进行统计。
- 十分内互动人数，由进入直播间、发送弹幕、送礼组成。
- 舰长收益有波动，按照B站推送消息处理（原价）。

### ISSUE
- 由于windows平台限制，obs等软件无法正确抓取透明窗口。解决方法一是窗口捕获，然后使用色度键处理背景色。二是使用显示器捕获，效果会比较好。可能会在未来版本里优化。
- 由于获取头像需要频繁调用B站Api，虽然本应用有本地缓存、节流，但在弹幕量大的情况下，仍然可能出现412（B站限流，个人空间打不开），目前如果触发了412，15分钟内不再尝试获取头像。如果想避免，可以设置头像大小为0，即不显示头像，也不会尝试拉接口。
- 目前本地缓存需要在启动时整理数据，累积数据过多会导致启动变慢，可以使用`备份并清理数据库`清除一下，备份文件生成在同目录下，作为归档，不需要的话可以删除。
- 发现bug可在issue反馈

### TODO
- icon、homepage、交互优化
- 直播间里已有sc展示
- 显示直播间信息，封禁词，多少级限制发言等等
- 抽奖功能
- 弹幕密度统计图
- 新礼物卡片设计
- 设置字体

### 版本更新计划
将把TODOLIST清空再更新。由于本项目强依赖于nodejs环境，无法直接使用浏览器嵌入obs，主要是为解决这个问题。将进行项目结构大改，启动一个本地服务器，主要用于与B站交互，缓存数据等，前端只与本地服务器交流，服务器搭建websocket数据通道。electron负责启动服务器，保存设置，独立出展示弹幕的前端页面，可使用浏览器打开。后续也可开放接口，接入自定义样式前端页面。

### developer

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build
```
// 全局变量
const globalVar = {
    name: 'bilibili-live-danmaku',
    voices: [],
    clientId: '',       // bridge 客户端标识，首次注册后持久化
    clientConfig: null,  // bridge 返回的完整配置（style, rooms, user 等）
    port: 3000,          // DEV 默认端口，PROD 由 startBiliBridge() 覆写
    baseUrl: 'http://127.0.0.1:3000',  // DEV 默认地址，PROD 由 startBiliBridge() 覆写
};

export default globalVar
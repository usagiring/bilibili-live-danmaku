// 全局变量
const globalVar = {
    name: 'bilibili-live-danmaku',
    voices: [],
    clientId: '',       // bridge 客户端标识，首次注册后持久化
    clientConfig: null,  // bridge 返回的完整配置（style, rooms, user 等）
};

export default globalVar
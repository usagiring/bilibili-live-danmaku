const api = require('../src/service/bilibili-api');

(async () => {
  const data = await api.getRoomInfo(5050)
  console.log(data)
})()



const axios = require('axios')
const fs = require('fs')
// const httpAdapter = require('axios/lib/adapters/http');
const {httpAdapter} = require('./http');
const baseLiveUrl = 'https://api.live.bilibili.com'

console.log(httpAdapter)

// const roomId = 22463523

export default function (roomId) {
    getPlayUrl(roomId, {
        adapter: httpAdapter,
        headers: {
            origin: 'https://live.bilibili.com',
            // Host: 'api.live.bilibili.com',
            referer: 'https://live.bilibili.com/',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.104 Safari/537.36'
        },
    })
        .then(result => {
            console.log(result);
            const playUrl = result.data.durl[0].url;
            console.log(playUrl);
            const output = fs.createWriteStream("xxx3.flv");
            axios({
                adapter: httpAdapter,
                method: "get",
                url: playUrl,
                headers: {
                    origin: 'https://live.bilibili.com',
                    // Host: 'api.live.bilibili.com',
                    referer: 'https://live.bilibili.com/',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.104 Safari/537.36'
                },
                responseType: "stream",
                // adapter: httpAdapter,
            })
                .then(response => {
                    console.log(response)
                    const stream = response.data;
                    stream.on("data", (chunk) => {
                        console.log(chunk);
                        output.write(new Buffer.from(chunk));
                    });
                    stream.on("end", () => {
                        output.end();
                    });
                    stream.on("error", (e) => {
                        console.error(e);
                    });
                })
                .catch((e) => {
                    console.error(e);
                });


        })
}

// console.log(data)



async function getPlayUrl(roomId, opts) {
    console.log(opts)
    const res = await axios.get(`${baseLiveUrl}/room/v1/Room/playUrl?cid=${roomId}&qn=0&platform=web`,opts)
    return res.data
}
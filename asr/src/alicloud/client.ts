import RPCClient from '@alicloud/pop-core'

export default class Client {
    client: RPCClient

    constructor({ accessKeyId, accessKeySecret }) {
        this.client = new RPCClient({
            accessKeyId: accessKeyId,
            accessKeySecret: accessKeySecret,
            endpoint: 'http://nls-meta.cn-shanghai.aliyuncs.com',
            apiVersion: '2019-02-28'
        });
    }

    async getToken() {
        // => returns Promise
        // => request(Action, params, options)
        const result: any = await this.client.request('CreateToken', {})
        return result.Token.Id
    }
}
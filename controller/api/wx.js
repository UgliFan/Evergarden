const Router = require('koa-router');
const axios = require('axios')
const route = new Router();
const WX_SECRET = process.env.WX_SECRET;

route.get('/openid', async ctx => {
    let jsCode = ctx.query.js_code || '';
    if (WX_SECRET && jsCode) {
        try {
            let res = await axios.get(`https://api.weixin.qq.com/sns/jscode2session?appid=wxc5cc3d1a4e28ce25&secret=${WX_SECRET}&js_code=${jsCode}&grant_type=authorization_code`)
            ctx.body = {
                code: 0,
                result: res.data || {}
            }
        } catch(e) {
            ctx.body = {
                code: -500,
                message: e.message || '未知错误'
            }
        }
    } else {
        ctx.body = {
            code: -1,
            message: '缺少必要参数'
        }
    }
});

module.exports = route;
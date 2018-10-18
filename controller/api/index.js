const Router = require('koa-router');
const route = new Router();

route.get('/userinfo', async ctx => {
    ctx.body = {
        mid: '123'
    };
});

module.exports = route;
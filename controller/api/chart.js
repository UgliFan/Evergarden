const Router = require('koa-router');
const route = new Router();

route.get('/pie', async ctx => {
    ctx.body = {
        code: 0,
        result: []
    };
});

module.exports = route;
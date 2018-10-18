const Router = require('koa-router');
const route = new Router();

route.get('/home', async ctx => {
    ctx.body = 'home';
});

module.exports = route;
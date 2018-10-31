const Router = require('koa-router');
const route = new Router();

route.get('/checkhealth', async ctx => {
    ctx.status = 200;
    ctx.body = 'ok';
});
route.get('/', async ctx => {
    ctx.body = 'home';
});

module.exports = route;
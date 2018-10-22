const Router = require('koa-router');
const route = new Router();

router.get('/checkhealth', async ctx => {
    ctx.status = 200;
    ctx.body = 'ok';
});
route.get('/home', async ctx => {
    ctx.body = 'home';
});

module.exports = route;
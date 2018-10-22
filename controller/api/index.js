const Router = require('koa-router');
const route = new Router();
const userCtl = require('./user');
const billCtl = require('./bill');

route.get('/checkhealth', async ctx => {
    ctx.status = 200;
    ctx.body = 'ok';
});

route.use('/user', userCtl.routes(), userCtl.allowedMethods());
route.use('/bill', billCtl.routes(), billCtl.allowedMethods());

module.exports = route;
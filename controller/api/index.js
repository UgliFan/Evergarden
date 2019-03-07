const Router = require('koa-router');
const route = new Router();
const userCtl = require('./user');
const wxCtl = require('./wx');
const categoryCtl = require('./categories');
const tallyCtl = require('./tally');

route.get('/checkhealth', async ctx => {
    ctx.status = 200;
    ctx.body = 'ok';
});

route.use('/user', userCtl.routes(), userCtl.allowedMethods());
route.use('/wx', wxCtl.routes(), wxCtl.allowedMethods());
route.use('/category', categoryCtl.routes(), categoryCtl.allowedMethods());
route.use('/tally', tallyCtl.routes(), tallyCtl.allowedMethods());

module.exports = route;
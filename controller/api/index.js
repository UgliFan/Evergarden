const Router = require('koa-router');
const route = new Router();
const usersCtl = require('./users');
const wxCtl = require('./wx');
const categoryCtl = require('./categories');
const tallyCtl = require('./tally');
const commonCtl = require('./common');
const chartCtl = require('./chart');

route.get('/checkhealth', async ctx => {
    ctx.status = 200;
    ctx.body = 'ok';
});

route.use('/users', usersCtl.routes(), usersCtl.allowedMethods());
route.use('/wx', wxCtl.routes(), wxCtl.allowedMethods());
route.use('/category', categoryCtl.routes(), categoryCtl.allowedMethods());
route.use('/tally', tallyCtl.routes(), tallyCtl.allowedMethods());
route.use('/common', commonCtl.routes(), commonCtl.allowedMethods());
route.use('/chart', chartCtl.routes(), chartCtl.allowedMethods());

module.exports = route;
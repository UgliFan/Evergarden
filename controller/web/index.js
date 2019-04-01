const Router = require('koa-router');
const route = new Router();
const homeCtl = require('./home.controller');
const { pv } = require('../../middlewares');

route.get('/versions', async ctx => {
    try {
        await ctx.initVersions();
        ctx.body = 'ok';
    } catch (e) {
        ctx.body = `err: ${e.message}`;
    }
});
route.get('home', '/', pv, homeCtl);

module.exports = route;
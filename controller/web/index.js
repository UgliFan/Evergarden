const Router = require('koa-router');
const route = new Router();
const homeCtl = require('./home.controller');

route.get('/versions', async ctx => {
    try {
        await ctx.initVersions();
        ctx.body = 'ok';
    } catch (e) {
        ctx.body = `err: ${e.message}`;
    }
});
route.get('home', '/', homeCtl);

module.exports = route;
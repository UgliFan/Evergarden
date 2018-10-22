const Router = require('koa-router');
const route = new Router();
const mysqlInstance = require('../../common/mysql');

route.get('/checkhealth', async ctx => {
    ctx.status = 200;
    ctx.body = 'ok';
});
route.get('/userinfo', async ctx => {
    let s = await mysqlInstance.QUERY('select * from test');
    ctx.body = s;
});

module.exports = route;
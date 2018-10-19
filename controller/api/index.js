const Router = require('koa-router');
const route = new Router();
const mysqlInstance = require('../../common/mysql');

route.get('/userinfo', async ctx => {
    let s = await mysqlInstance.QUERY('select * from test');
    ctx.body = s;
});

module.exports = route;
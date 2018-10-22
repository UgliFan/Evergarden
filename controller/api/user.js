const Router = require('koa-router');
const route = new Router();
const mysqlInstance = require('../../common/mysql');

route.get('/info', async ctx => {
    let s = await mysqlInstance.QUERY('select uid,uname,avatar,sex,tag,alias,sign,bigavatar,createtime,birthday from user');
    ctx.body = s;
});

module.exports = route;
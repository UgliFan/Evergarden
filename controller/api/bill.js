const Router = require('koa-router');
const route = new Router();
const mysqlInstance = require('../../common/mysql');
const { formatTime } = require('../../common/utils');
const uuid = require('uuid/v4');

route.post('/create', async ctx => {
    const reqBody = ctx.request.body || {};
    const sum = reqBody.sum || 0;
    const address = reqBody.address || '';
    const position = reqBody.position || '';
    const type = Number(reqBody.type);
    const createTime = formatTime(new Date());
    const remark = reqBody.remark || '';
    const payType = Number(reqBody.pay_type);
    const payTime = reqBody.pay_time || createTime;
    const author = reqBody.author;
    const month = new Date().toISOString().substr(0, 7);
    const bid = uuid().replace(/-/g, '');
    await mysqlInstance.INSERT('bill', {
        bid, sum, address, position, type,
        create_time: createTime,
        remark,
        pay_type: payType,
        pay_time: payTime,
        author
    }, ctx);
    if (ctx.SQL_SUCCESS) {
        ctx.status = 200;
        ctx.body = 'ok';
    }
});

route.get('/list', async ctx => {
    let list = await mysqlInstance.SELECT('bill', null, ctx);
    if (ctx.SQL_SUCCESS) {
        ctx.body = list;
    }
});

route.get('/check', async ctx => {
    let isExist = await mysqlInstance.EXIST_TABLE('user');
    ctx.body = isExist ? 'exist' : 'not exist';
});

module.exports = route;
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
    try {
        const bid = uuid().replace(/-/g, '');
        await mysqlInstance.INSERT(`insert into bill 
            (bid,sum,address,position,type,create_time,update_time,remark,pay_type,pay_time,author) values 
            ('${bid}',${sum},'${address}','${position}',${type},'${createTime}','${createTime}','${remark}',${payType},'${payTime}','${author}')`);
        ctx.status = 200;
        ctx.body = 'ok';
    } catch (e) {
        ctx.status = 500;
        ctx.body = e.message;
    }
});

module.exports = route;
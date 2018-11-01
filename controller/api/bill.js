const Router = require('koa-router');
const route = new Router();
const mysqlInstance = require('../../common/mysql');
const { formatTime } = require('../../common/utils');
const uuid = require('uuid/v4');

route.post('/create', async ctx => {
    const reqBody = ctx.request.body || {};
    const sum = Number(reqBody.sum || 0);
    const address = reqBody.address || '';
    const position = reqBody.position || '';
    const type = Number(reqBody.type);
    const createTime = formatTime(new Date());
    const remark = reqBody.remark || '';
    const payType = Number(reqBody.pay_type);
    const payTime = reqBody.pay_time || createTime;
    const author = reqBody.author;
    const month = new Date().toISOString().substr(0, 7).replace(/(-|\/)/g, '_');
    const bid = uuid().replace(/-/g, '');

    let table = `bill${month}`;
    let isExist = await mysqlInstance.EXIST_TABLE(table);
    const doInsert = async (tableName) => {
        return await mysqlInstance.INSERT(tableName, {
            bid, sum, address, position, type,
            create_time: createTime,
            remark,
            pay_type: payType,
            pay_time: payTime,
            author
        }, ctx);
    };
    let result = null;
    if (isExist) {
        result = await doInsert(table);
    } else {
        await mysqlInstance.CREATE_BILL(table, ctx);
        if (ctx.SQL_SUCCESS) {
            result = await doInsert(table);
        } else {
            console.log('CREATE_BILL ERROR');
        }
    }
    if (ctx.SQL_SUCCESS) {
        ctx.status = 200;
        ctx.body = {
            code: 0,
            result: result
        };
    }
});

route.get('/list', async ctx => {
    let month = (ctx.query.month || '').replace(/(-|\/)/g, '_');
    if (month) {
        let isExist = await mysqlInstance.EXIST_TABLE(`bill${month}`);
        if (isExist) {
            let list = await mysqlInstance.SELECT(`bill${month}`, null, ctx);
            if (ctx.SQL_SUCCESS) {
                ctx.body = list;
            }
        } else {
            ctx.body = {
                code: -1,
                message: '还没有所选月份的数据'
            };
        }
    } else {
        ctx.body = {
            code: -1,
            message: '缺少必要参数'
        };
    }
});

route.get('/check', async ctx => {
    let isExist = await mysqlInstance.EXIST_TABLE('bill');
    ctx.body = isExist ? 'exist' : 'not exist';
});

module.exports = route;
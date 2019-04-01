const { getIp } = require('../common/utils');
const mysqlInstance = require('../common/mysql');
const uuid = require('uuid/v4');

let ipTable = {};
const updatePv = async ctx => {
    let result = await mysqlInstance.SELECT('global_kv', {
        where: {
            global_key: 'uglifan_pv'
        }
    }, ctx);
    if (ctx.SQL_SUCCESS && result && result.length > 0) {
        let value = parseInt(result[0].global_value);
        if (isNaN(value)) value = 0;
        await mysqlInstance.UPDATE('global_kv', {
            where: {
                global_key: 'uglifan_pv'
            },
            values: {
                global_value: (value + 1).toString()
            }
        }, ctx);
    } else {
        await mysqlInstance.INSERT('global_kv', {
            id: uuid().replace(/-/g, ''),
            global_key: 'uglifan_pv',
            global_value: '1'
        }, ctx);
    }
};
const updateUv = async ctx => {
    let result = await mysqlInstance.SELECT('global_kv', {
        where: {
            global_key: 'uglifan_uv'
        }
    }, ctx);
    if (ctx.SQL_SUCCESS && result && result.length > 0) {
        let value = parseInt(result[0].global_value);
        if (isNaN(value)) value = 0;
        await mysqlInstance.UPDATE('global_kv', {
            where: {
                global_key: 'uglifan_uv'
            },
            values: {
                global_value: (value + 1).toString()
            }
        }, ctx);
    } else {
        await mysqlInstance.INSERT('global_kv', {
            id: uuid().replace(/-/g, ''),
            global_key: 'uglifan_uv',
            global_value: '1'
        }, ctx);
    }
};
module.exports = async (ctx, next) => {
    let isExist = await mysqlInstance.EXIST_TABLE('global_kv');
    if (!isExist) {
        await mysqlInstance.CREATE_KV(ctx);
    }
    await updatePv(ctx);
    let date = new Date();
    let tableKey = `day_${date.getDate()}`;
    const ip = getIp(ctx.request);
    if (ipTable.key !== tableKey) {
        ipTable = { key: tableKey, list: [] };
    }
    if (ipTable.list.indexOf(ip) < 0) {
        ipTable.list.push(ip);
        await updateUv(ctx);
    }
    console.log(ctx.body);
    ctx.body = '';
    ctx.set('content-type', 'text/html');
    await next();
};
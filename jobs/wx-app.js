const CronJob = require('cron').CronJob;
const mysqlInstance = require('../common/mysql');

let MEM_CACHE = {};

let isRunning = false;
const start = async () => {
    let ctx = {};
    let result = {};
    const colts = await mysqlInstance.MATCH_TABLE('tally_%');
    let coltNames = [];
    colts.forEach(item => {
        let keys = Object.keys(item);
        keys.forEach(key => {
            coltNames.push(item[key]);
        })
    });
    coltNames.forEach(async item => {
        const select = await mysqlInstance.SELECT(item, {
            columns: [
                'open_id',
                'type',
                'SUM(summary) as `sum`'
            ],
            join: [{
                tb: 'categories',
                leftKey: 'cid',
                rightKey: 'id'
            }],
            groupBy: 'open_id, type'
        }, ctx);
        if (ctx.SQL_SUCCESS) {
            select.forEach(row => {
                let typeKey = row.type === 0 ? 'outCount' : 'inCount';
                if (!result[row.open_id]) result[row.open_id] = {};
                if (result[row.open_id][typeKey]) {
                    result[row.open_id][typeKey] = result[row.open_id][typeKey] + row.sum;
                } else {
                    result[row.open_id][typeKey] = row.sum;
                }
            });
        }
    });
    MEM_CACHE = result;
};
const JOB = new CronJob({
    cronTime: '0 */5 * * * *', // s m h d M week
    onTick: async () => {
        isRunning = true;
        await start();
        isRunning = false;
    },
    start: false,
    timeZone: 'Asia/Shanghai'
});
JOB.start();
const WxRunJob = async ctx => {
    if (isRunning) {
        ctx.body = {
            code: -600,
            message: 'job is running, please wait.'
        };
    } else {
        try {
            await start()
            ctx.body = {
                code: 0,
                message: 'ok'
            };
        } catch (e) {
            ctx.body = {
                code: -500,
                message: e.message || '未知错误'
            };
        }
    }
};
const WxAllCount = async ctx => {
    const query = ctx.query || {};
    if (query.id) {
        let result = MEM_CACHE[query.id];
        if (result) {
            ctx.body = {
                code: 0,
                result: result
            };
        } else {
            ctx.body = {
                code: -404,
                message: '没有找到内容'
            };
        }
    } else {
        ctx.body = {
            code: -1,
            message: '缺少必要参数'
        };
    }
};
const WxPandect = async ctx => {
    let inCount = 0;
    let outCount = 0;
    for (let key in MEM_CACHE) {
        if (key && Object.prototype.hasOwnProperty.call(MEM_CACHE, key) && MEM_CACHE[key]) {
            let count = MEM_CACHE[key];
            inCount += count.inCount;
            outCount += count.outCount;
        }
    }
    ctx.body = {
        code: 0,
        result: {
            inCount: inCount,
            outCount: outCount
        }
    };
};
module.exports = {
    WxRunJob, WxAllCount, WxPandect
};
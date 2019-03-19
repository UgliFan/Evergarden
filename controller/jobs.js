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
            if (result.source) {
                result.source = result.source.concat(select);
            } else {
                result.source = select;
            }
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
const RunJob = async ctx => {
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
const AllCount = async ctx => {
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
module.exports = {
    RunJob, AllCount
};
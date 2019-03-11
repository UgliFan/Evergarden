const Router = require('koa-router');
const route = new Router();
const mysqlInstance = require('../../common/mysql');

route.get('/pie', async ctx => {
    const query = ctx.query || {};
    if (query.y && query.m) {
        const coltName = `tally_${query.y}_${query.m}`;
        const isExsit = await mysqlInstance.EXIST_TABLE(coltName);
        if (isExsit) {
            const select = await mysqlInstance.SELECT(coltName, {
                columns: [
                    'cid',
                    '`name`',
                    'SUM(summary) AS `sum`'
                ],
                where: {
                    type: Number(query.type || 0)
                },
                join: [{
                    tb: 'categories',
                    leftKey: 'cid',
                    rightKey: 'id'
                }],
                groupBy: 'cid',
                order: {
                    key: '`sum`',
                    type: 'desc'
                }
            }, ctx);
            if (ctx.SQL_SUCCESS) {
                let result = select.map(item => {
                    return {
                        name: item.name,
                        value: item.sum
                    };
                });
                ctx.body = {
                    code: 0,
                    result: result
                };
            }
        } else {
            ctx.body = {
                code: 0,
                result: []
            };
        }
    } else {
        ctx.body = {
            code: 0,
            result: []
        };
    }
});

module.exports = route;
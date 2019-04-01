const Router = require('koa-router');
const route = new Router();
const mysqlInstance = require('../../common/mysql');

route.get('/list', async ctx => {
    const query = ctx.query || {};
    const page = query.p || 0;
    const pageSize = query.ps || 20;
    const sort = query.o || 'desc';
    let isExsit = await mysqlInstance.EXIST_TABLE('article_to_read');
    if (isExsit) {
        let res = await mysqlInstance.SELECT('article_to_read', {
            order: {
                key: ['create_at', 'hot'],
                type: sort
            },
            limit: {
                start: pageSize * page,
                length: pageSize
            }
        }, ctx);
        if (ctx.SQL_SUCCESS) {
            ctx.body = {
                code: 0,
                result: res || []
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
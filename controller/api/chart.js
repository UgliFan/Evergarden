const Router = require('koa-router');
const route = new Router();
const mysqlInstance = require('../../common/mysql');
const { WxPandect } = require('../../jobs');

route.get('/pie', async ctx => {
    const query = ctx.query || {};
    if (query.y && query.m) {
        const coltName = `tally_${query.y}_${query.m}`;
        const isExsit = await mysqlInstance.EXIST_TABLE(coltName);
        if (isExsit) {
            const selectOut = await mysqlInstance.SELECT(coltName, {
                columns: [
                    'cid',
                    '`name`',
                    'SUM(summary) AS `sum`'
                ],
                where: {
                    type: 0,
                    open_id: query.id
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
            const selectIn = await mysqlInstance.SELECT(coltName, {
                columns: [
                    'cid',
                    '`name`',
                    'SUM(summary) AS `sum`'
                ],
                where: {
                    type: 1,
                    open_id: query.id
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
                let outList = selectOut.map(item => {
                    return {
                        name: item.name,
                        value: item.sum / 100
                    };
                });
                let inList = selectIn.map(item => {
                    return {
                        name: item.name,
                        value: item.sum / 100
                    };
                });
                ctx.body = {
                    code: 0,
                    result: { outList, inList }
                };
            }
        } else {
            ctx.body = {
                code: 0,
                result: {
                    outList: [],
                    inList: []
                }
            };
        }
    } else if (query.y) {
        ctx.body = {
            code: 0,
            result: {
                outList: [],
                inList: []
            }
        };
    } else {
        ctx.body = {
            code: -1,
            message: '缺少必要参数'
        };
    }
});

route.get('/bar', async ctx => {
    const query = ctx.query || {};
    if (query.y && query.m) {
        const coltName = `tally_${query.y}_${query.m}`;
        const isExsit = await mysqlInstance.EXIST_TABLE(coltName);
        if (isExsit) {
            const selectOut = await mysqlInstance.SELECT(coltName, {
                columns: [
                    'date_format',
                    'SUM(summary) AS `sum`'
                ],
                where: {
                    type: 0,
                    open_id: query.id
                },
                join: [{
                    tb: 'categories',
                    leftKey: 'cid',
                    rightKey: 'id'
                }],
                groupBy: 'date_format',
                order: {
                    key: 'date',
                    type: 'asc'
                }
            }, ctx);
            const selectIn = await mysqlInstance.SELECT(coltName, {
                columns: [
                    'date_format',
                    'SUM(summary) AS `sum`'
                ],
                where: {
                    type: 1,
                    open_id: query.id
                },
                join: [{
                    tb: 'categories',
                    leftKey: 'cid',
                    rightKey: 'id'
                }],
                groupBy: 'date_format',
                order: {
                    key: 'date',
                    type: 'asc'
                }
            }, ctx);
            if (ctx.SQL_SUCCESS) {
                let outList = selectOut.map(item => {
                    return {
                        name: item.date_format,
                        value: item.sum / 100
                    };
                });
                let inList = selectIn.map(item => {
                    return {
                        name: item.date_format,
                        value: item.sum / 100
                    };
                });
                ctx.body = {
                    code: 0,
                    result: { outList, inList }
                };
            }
        } else {
            ctx.body = {
                code: 0,
                result: {
                    outList: [],
                    inList: []
                }
            };
        }
    } else if (query.y) {
        ctx.body = {
            code: 0,
            result: {
                outList: [],
                inList: []
            }
        };
    } else {
        ctx.body = {
            code: -1,
            message: '缺少必要参数'
        };
    }
});

route.get('/all', WxPandect);

module.exports = route;
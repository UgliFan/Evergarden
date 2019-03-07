const Router = require('koa-router');
const route = new Router();
const mysqlInstance = require('../../common/mysql');
const uuid = require('uuid/v4');
const { formatTime, weeks } = require('../../common/utils');

route.get('/page', async ctx => {
    const query = ctx.query || {};
    const page = query.p || 0;
    const pageSize = query.ps || 20;
    const sort = query.o || 'desc';
    if (query.y && query.m) {
        const coltName = `tally_${query.y}_${query.m}`;
        let isExist = await mysqlInstance.EXIST_TABLE(coltName);
        if (isExist) {
            let res = await mysqlInstance.SELECT(coltName, {
                columns: [
                    `${coltName}.id`,
                    `${coltName}.open_id`,
                    `${coltName}.date`,
                    `${coltName}.date_format`,
                    `${coltName}.create_at`,
                    `${coltName}.remark`,
                    `${coltName}.summary`,
                    `${coltName}.latitude`,
                    `${coltName}.longitude`,
                    `${coltName}.cid`,
                    'categories.icon',
                    'categories.`name`',
                    'categories.type'
                ],
                join: {
                    tb: 'categories',
                    leftKey: 'cid',
                    rightKey: 'id'
                },
                order: {
                    key: `create_at`,
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
                    result: res
                };
            }
        } else {
            ctx.body = {
                code: 0,
                result: [],
                total: 0
            };
        }
    } else {
        ctx.body = {
            code: -1,
            message: '缺少必要参数'
        };
    }
})

route.post('/create', async ctx => {
    const body = ctx.request.body || {};
    if (body.open_id && body.date && body.cid && body.summary) {
        const date = new Date(body.date);
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        if (month < 10) month = `0${month}`;
        const coltName = `tally_${year}_${month}`;
        const doInsert = async () => {
            const dateFormat = formatTime(date);
            const params = {
                id: uuid().replace(/-/g, ''),
                open_id: body.open_id,
                date: dateFormat,
                latitude: body.latitude || '',
                longitude: body.longitude || '',
                remark: body.remark || '',
                cid: body.cid,
                summary: Number(body.summary) * 100,
                type_backup: body.type_backup !== undefined ? Number(body.type_backup) : -1,
                create_at: formatTime(new Date()),
                date_format: `${dateFormat.split(' ')[0]} ${weeks[date.getDay()]}`
            };
            return await mysqlInstance.INSERT(coltName, params, ctx);
        };
        let res = null;
        let isExist = await mysqlInstance.EXIST_TABLE(coltName);
        if (isExist) {
            res = await doInsert();
        } else {
            await mysqlInstance.CREATE_TALLY(coltName, ctx);
            if (ctx.SQL_SUCCESS) {
                res = await doInsert();
            }
        }
        if (ctx.SQL_SUCCESS) {
            ctx.body = {
                code: 0,
                result: res
            };
        }
    } else {
        ctx.body = {
            code: -1,
            message: '缺少必要参数'
        };
    }
})

route.post('/modify', async ctx => {
    ctx.body = {
        code: 0,
        result: {}
    };
})

route.post('/delete', async ctx => {
    const body = ctx.request.body || {};
    if (body.id && body.y && body.m) {
        const openId = ctx.cookies.get('__source_op');
        const coltName = `tally_${body.y}_${body.m}`;
        const isExist = await mysqlInstance.EXIST_TABLE(coltName);
        if (!openId) {
            ctx.body = {
                code: -100,
                message: '你没有删除本条数据的权限'
            };
        } else if (isExist) {
            const select = await mysqlInstance.SELECT(coltName, {
                where: {
                    id: body.id,
                    open_id: openId
                }
            }, ctx);
            if (ctx.SQL_SUCCESS && select.length > 0) {
                const res = await mysqlInstance.DELETE(coltName, {
                    where: {
                        id: body.id,
                        open_id: openId
                    }
                }, ctx);
                if (ctx.SQL_SUCCESS) {
                    ctx.body = {
                        code: 0,
                        result: res
                    };
                }
            } else {
                ctx.body = {
                    code: -100,
                    message: '你没有删除本条数据的权限'
                };
            }
        } else {
            ctx.body = {
                code: 0,
                message: '删除跳过了'
            };
        }
    } else {
        ctx.body = {
            code: -1,
            message: '缺少必要参数'
        };
    }
})

module.exports = route;

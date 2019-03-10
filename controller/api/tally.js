const Router = require('koa-router');
const route = new Router();
const mysqlInstance = require('../../common/mysql');
const uuid = require('uuid/v4');
const { formatTime, weeks } = require('../../common/utils');

const CACHE_EXPIRE_TIME = 1000 * 5;
let countCache = {};

route.get('/picker', async ctx => {
    const select = await mysqlInstance.MATCH_TABLE('tally_%');
    let years = [];
    select.forEach(item => {
        let keys = Object.keys(item);
        keys.forEach(key => {
            let value = item[key];
            let split = value.split('_');
            if (years.indexOf(split[1]) < 0) years.push(split[1]);
        })
    });
    years = years.sort()
    let maxYear = years[years.length - 1]
    years.push((Number(maxYear) + 1).toString())
    ctx.body = {
        code: 0,
        result: years
    };
})

route.get('/page', async ctx => {
    const query = ctx.query || {};
    const page = query.p || 0;
    const pageSize = query.ps || 20;
    const sort = query.o || 'desc';
    if (query.y && query.m) {
        const coltName = `tally_${query.y}_${query.m}`;
        let isExist = await mysqlInstance.EXIST_TABLE(coltName);
        if (isExist) {
            let sum = countCache[coltName] && countCache[coltName].expires > Date.now() ? countCache[coltName].sum : null;
            if (!sum) {
                let select = await mysqlInstance.SELECT(coltName, {
                    columns: ['type' ,'SUM(summary) AS `sum`'],
                    join: [{
                        tb: 'categories',
                        leftKey: 'cid',
                        rightKey: 'id'
                    }],
                    groupBy: 'categories.type'
                }, ctx)
                sum = {
                    inCount: 0,
                    outCount: 0
                };
                if (ctx.SQL_SUCCESS) {
                    select.forEach(item => {
                        if (item.type === 0) {
                            sum.outCount = item.sum;
                        } else {
                            sum.inCount = item.sum;
                        }
                    })
                    countCache[coltName] = {
                        expires: Date.now() + CACHE_EXPIRE_TIME,
                        sum: sum
                    };
                }
            }
            let res = await mysqlInstance.SELECT(coltName, {
                columns: [
                    `${coltName}.id`,
                    `${coltName}.open_id`,
                    `DATE_FORMAT(${coltName}.date, '%Y-%m-%d %T') as date`,
                    `${coltName}.date_format`,
                    `DATE_FORMAT(${coltName}.create_at, '%Y-%m-%d %T') as create_at`,
                    `${coltName}.remark`,
                    `${coltName}.summary`,
                    `${coltName}.cid`,
                    'categories.icon',
                    'categories.`name`',
                    'categories.type',
                    'users.`name` as nickName',
                    'users.gender',
                    'users.avatar'
                ],
                join: [{
                    tb: 'categories',
                    leftKey: 'cid',
                    rightKey: 'id'
                }, {
                    tb: 'users',
                    leftKey: 'open_id',
                    rightKey: 'open_id'
                }],
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
                let group = {};
                let other = [];
                let order = 0;
                res.forEach(item => {
                    if (item.date_format && group[item.date_format]) {
                        group[item.date_format].list.push(item);
                    } else if (item.date_format) {
                        group[item.date_format] = {
                            list: [item],
                            order: order
                        };
                        order++;
                    } else {
                        other.push(item);
                    }
                });
                if (other.length > 0) {
                    group['未知日期'] = {
                        list: other,
                        order: order + 1
                    };
                }
                ctx.body = {
                    code: 0,
                    result: group,
                    sum: sum
                };
            }
        } else {
            ctx.body = {
                code: 0,
                result: [],
                sum: {
                    inCount: 0,
                    outCount: 0
                }
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
    const body = ctx.request.body || {};
    if (body.id && body.date) {
        const date = new Date(body.date);
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        if (month < 10) month = `0${month}`;
        const coltName = `tally_${year}_${month}`;
        const openId = ctx.cookies.get('__source_op');
        let isExist = await mysqlInstance.EXIST_TABLE(coltName);
        if (!openId) {
            ctx.body = {
                code: -100,
                message: '你没有修改本条数据的权限'
            };
        } else if (isExist) {
            const select = await mysqlInstance.SELECT(coltName, {
                where: {
                    id: body.id,
                    open_id: openId
                }
            }, ctx);
            if (ctx.SQL_SUCCESS && select.length > 0) {
                const dateFormat = formatTime(date);
                let params = {
                    date: dateFormat,
                    date_format: `${dateFormat.split(' ')[0]} ${weeks[date.getDay()]}`,
                    remark: body.remark || ''
                };
                if (body.summary) params.summary = Number(body.summary) * 100;
                if (body.cid) params.cid = body.cid;
                const res = await mysqlInstance.UPDATE(coltName, {
                    where: {
                        id: body.id
                    },
                    values: params
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
                    message: '你没有修改本条数据的权限'
                };
            }
        } else {
            ctx.body = {
                code: 0,
                message: '不存在的表'
            };
        }
    } else {
        ctx.body = {
            code: -1,
            message: '缺少必要参数'
        };
    }
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
                        id: body.id
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

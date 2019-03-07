const Router = require('koa-router');
const route = new Router();
const mysqlInstance = require('../../common/mysql');
const uuid = require('uuid/v4');

route.get('/list', async ctx => {
    let type = Number(ctx.query.type || 0);
    let isExist = await mysqlInstance.EXIST_TABLE('categories');
    if (isExist) {
        let list = await mysqlInstance.SELECT(`categories`, {
            where: {
                type: type
            }
        }, ctx);
        if (ctx.SQL_SUCCESS) {
            ctx.body = {
                code: 0,
                type: type,
                result: list
            };
        }
    } else {
        ctx.body = {
            code: -601,
            message: '查询的表不存在'
        };
    }
});

route.post('/create', async ctx  => {
    const body = ctx.request.body || {};
    if (body.type !== undefined && body.name && body.icon) {
        const doInsert = async () => {
            const params = {
                id: uuid().replace(/-/g, ''),
                type: body.type,
                name: body.name,
                icon: body.icon,
                remark: body.remark || ''
            };
            return await mysqlInstance.INSERT('categories', params, ctx);
        };
        let res = null;
        let isExist = await mysqlInstance.EXIST_TABLE('categories');
        if (isExist) {
            res = await doInsert();
        } else {
            await mysqlInstance.CREATE_CATEGORY(ctx);
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
});

route.post('/delete', async ctx => {
    const body = ctx.request.body || {};
    if (body.id) {
        let isExist = await mysqlInstance.EXIST_TABLE('categories');
        if (isExist) {
            const res = await mysqlInstance.DELETE('categories', {
                where: {
                    id: body.id
                }
            }, ctx)
            if (ctx.SQL_SUCCESS) {
                ctx.body = {
                    code: 0,
                    result: res
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
});

route.post('/modify', async ctx => {
    const body = ctx.request.body || {};
    if (body.id) {
        let isExist = await mysqlInstance.EXIST_TABLE('categories');
        if (isExist) {
            let params = {};
            if (body.name) params.name = body.name;
            if (body.type !== undefined) params.type = body.type;
            if (body.icon) params.icon = body.icon;
            if (body.remark) params.remark = body.remark;
            if (Object.keys(params).length > 0) {
                const res = await mysqlInstance.UPDATE('categories', {
                    where: {
                        id: body.id
                    },
                    values: params
                }, ctx)
                if (ctx.SQL_SUCCESS) {
                    ctx.body = {
                        code: 0,
                        result: res
                    };
                }
            } else {
                ctx.body = {
                    code: 0,
                    message: '没有修改内容'
                };
            }
        } else {
            ctx.body = {
                code: 0,
                message: '没有categories表'
            };
        }
    } else {
        ctx.body = {
            code: -1,
            message: '缺少必要参数'
        };
    }
});

module.exports = route;
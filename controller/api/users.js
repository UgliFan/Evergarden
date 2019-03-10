const Router = require('koa-router');
const route = new Router();
const mysqlInstance = require('../../common/mysql');
const { formatTime } = require('../../common/utils');

route.get('/info', async ctx => {
    const query = ctx.query || {};
    let params = {};
    if (query.id) params.open_id = query.id;
    if (query.name) params.name = query.name;
    const select = await mysqlInstance.SELECT('users', {
        where: params
    }, ctx);
    if (ctx.SQL_SUCCESS && select.length === 1) {
        ctx.body = {
            code: 0,
            result: select[0]
        };
    } else if (ctx.SQL_SUCCESS && select.length > 1) {
        ctx.body = {
            code: -404,
            message: '有重复信息，请提供更精确的筛选'
        };
    } else if (ctx.SQL_SUCCESS) {
        ctx.body = {
            code: -404,
            message: '没有匹配到信息'
        };
    }
})
route.post('/upgrade', async ctx => {
    const body = ctx.request.body || {};
    const openId = body.id;
    let params = {};
    if (body.name) params.name = body.name;
    if (body.gender !== undefined) params.gender = body.gender;
    if (body.avatar) params.avatar = body.avatar;
    if (body.city) params.city = body.city;
    if (body.province) params.province = body.province;
    if (body.country) params.country = body.country;
    const select = await mysqlInstance.SELECT('users', {
        where: {
            open_id: openId
        }
    }, ctx)
    if (ctx.SQL_SUCCESS && select.length > 0) {
        const res = await mysqlInstance.UPDATE('users', {
            where: {
                open_id: openId
            },
            values: params
        }, ctx);
        if (ctx.SQL_SUCCESS) {
            ctx.body = {
                code: 0,
                result: res
            };
        }
    } else if (ctx.SQL_SUCCESS) {
        params.open_id = openId;
        params.create_at = formatTime(new Date());
        const res = await mysqlInstance.INSERT('users', params, ctx);
        if (ctx.SQL_SUCCESS) {
            ctx.body = {
                code: 0,
                result: res
            };
        }
    }
});

module.exports = route;
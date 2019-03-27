const { getIp } = require('../../common/utils');

module.exports = async ctx => {
    const context = {
        degrade: true,
        url: ctx.url,
        path: ctx.path,
        userAgent: ctx.headers['user-agent'],
        queryString: ctx.querystring,
        query: ctx.query,
        cookie: ctx.headers.cooke,
        ip: getIp(ctx.req)
    };
    await ctx.react('home', context);
};
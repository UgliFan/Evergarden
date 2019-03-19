const Router = require('koa-router');
const route = new Router();
const mysqlInstance = require('../../common/mysql');
const { RunJob, AllCount } = require('../jobs');

route.get('/years', async ctx => {
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
    ctx.body = {
        code: 0,
        result: years.sort()
    };
});

route.get('/runjob', RunJob);
route.get('/allcount', AllCount);

module.exports = route;
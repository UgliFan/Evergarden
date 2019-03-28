const Router = require('koa-router');
const { execFile } = require('child_process');
const { resolve } = require('path');
const route = new Router();
const mysqlInstance = require('../../common/mysql');
const { createHmac } = require('crypto');
const { RunJob, AllCount } = require('../jobs');

const execShell = () => {
    return new Promise(resolv => {
        try {
            execFile(resolve(__dirname, '../../shell/publish_home.sh'), null, null, (error, stdout, stderr) => {
                if (error) {
                    console.log(error);
                }
                console.log('exec shell done.');
                resolv();
            });
        } catch (e) {
            console.log('catch', e);
            resolv();
        };
    });
};

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
route.post('/webhook', async ctx => {
    let body = JSON.stringify(ctx.request.body);
    const sig = ctx.request.get('x-hub-signature');
    const event = ctx.request.get('x-github-event');
    const delivery = ctx.request.get('x-github-delivery');
    const signBlob = 'sha1=' + createHmac('sha1', process.env.WEBHOOK_SECRET).update(body).digest('hex');
    if (sig === signBlob && event === 'push' && delivery) {
        await execShell();
        ctx.body = 'ok';
    } else if (sig !== signBlob) {
        ctx.status = 500;
        ctx.body = 'X-Hub-Signature not matched';
    } else if (event !== 'push') {
        ctx.status = 500;
        ctx.body = 'X-Github-Event not matched push';
    } else if (!delivery) {
        ctx.status = 500;
        ctx.body = 'No X-Github-Delivery';
    }
});

module.exports = route;
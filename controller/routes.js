const Router = require('koa-router');
const router = new Router();

const apiCtl = require('./api');
const webCtl = require('./web');
router.get('/checkhealth', async ctx => {
    ctx.status = 200;
    ctx.body = 'ok';
});
router.use(webCtl.routes(), webCtl.allowedMethods());
router.use('/api', apiCtl.routes(), apiCtl.allowedMethods());

module.exports = router;
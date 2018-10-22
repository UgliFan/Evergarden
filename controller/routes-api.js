const Router = require('koa-router');
const router = new Router();

const apiCtl = require('./api');
router.use('/api', apiCtl.routes(), apiCtl.allowedMethods());

module.exports = router;
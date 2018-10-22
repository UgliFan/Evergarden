const Router = require('koa-router');
const router = new Router();

const apiCtl = require('./api');
router.use(apiCtl.routes(), apiCtl.allowedMethods());

module.exports = router;
const Router = require('koa-router');
const router = new Router();

const webCtl = require('./web');
router.use(webCtl.routes(), webCtl.allowedMethods());

module.exports = router;
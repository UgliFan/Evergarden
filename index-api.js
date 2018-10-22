const Koa = require('koa');
const router = require('./controller/routes-api');

const app = new Koa();

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(process.env.NODE_PORT || 3001);
console.log(`Server is listen at ${process.env.NODE_PORT || 3001}`);

module.exports = app;
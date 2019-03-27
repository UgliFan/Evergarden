const Koa = require('koa');
const router = require('./controller/routes');
const { react } = require('./middlewares');

const app = new Koa();

react(app);
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(process.env.NODE_PORT || 3000);
console.log(`Server is listen at ${process.env.NODE_PORT || 3000}`);

module.exports = app;
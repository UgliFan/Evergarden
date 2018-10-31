const Router = require('koa-router');
const route = new Router();
const mysqlInstance = require('../../common/mysql');
const { formatTime } = require('../../common/utils');
const md5 = require('md5');
const uuid = require('uuid/v4');

route.get('/info', async ctx => {
    let uid = ctx.cookies.get('TBK_USR');
    if (uid) {
        let result = await mysqlInstance.SELECT('user', {
            columns: ['uid', 'uname', 'avatar', 'sex', 'tag', 'alias', 'sign', 'bigavatar', 'createtime', 'birthday'],
            where: {
                uid: uid
            }
        }, ctx);
        if (ctx.SQL_SUCCESS && result[0]) {
            ctx.body = {
                code: 0,
                result: result[0]
            };
        } else {
            ctx.body = {
                code: -404,
                message: '登录的用户不存在'
            };
        }
    } else {
        ctx.body = {
            code: -101,
            message: '未登录'
        };
    }
});

route.post('/login', async ctx => {
    let reqBody = ctx.request.body || {};
    let userName = reqBody.uname;
    let passWord = md5(reqBody.pass + process.env.NODE_MYSQL_APPSECRET).toUpperCase();
    let result = await mysqlInstance.SELECT('user', {
        columns: ['uid', 'uname', 'password', 'avatar', 'sex', 'tag', 'alias', 'sign', 'bigavatar', 'createtime', 'birthday'],
        where: {
            uname: userName
        }
    }, ctx);
    if (ctx.SQL_SUCCESS && result.length > 0) {
        let userInfo = null;
        result.forEach(info => {
            if (info.password === passWord) userInfo = info;
        });
        if (userInfo !== null) {
            delete userInfo.password;
            ctx.cookies.set('TBK_USR', userInfo.uid, {
                domain: ctx.host,
                path: '/',
                maxAge: 1000 * 60 * 60 * 24 * 30,
                httpOnly: false,
                overwrite: false
            });
            ctx.body = {
                code: 0,
                result: userInfo
            };
        } else {
            ctx.body = {
                code: -102,
                message: '密码错误'
            };
        }
    } else {
        ctx.body = {
            code: -103,
            message: '用户不存在'
        };
    }
});

route.post('/register', async ctx => {
    let reqBody = ctx.request.body || {};
    let userName = reqBody.uname;
    let passWord = md5(reqBody.pass + process.env.NODE_MYSQL_APPSECRET).toUpperCase();
    let alias = reqBody.alias || userName;
    let avatar = reqBody.avatar || '';
    let sex = Number(reqBody.sex || 1);
    let tag = reqBody.tag || '';
    let sign = reqBody.sign || '什么都没写~';
    let bigAvatar = reqBody.bigavatar || '';
    let createTime = formatTime(new Date());
    let birthday = reqBody.birthday ? formatTime(new Date(reqBody.birthday)) : null;
    if (userName && reqBody.pass) {
        let checkHasUser = await mysqlInstance.SELECT('user', {
            columns: ['uid', 'uname', 'password', 'avatar', 'sex', 'tag', 'alias', 'sign', 'bigavatar', 'createtime', 'birthday'],
            where: {
                uname: userName
            }
        }, ctx);
        if (checkHasUser.length > 0) {
            ctx.body = {
                code: -104,
                mesasge: '用户名已存在'
            };
        } else {
            const bid = uuid().replace(/-/g, '');
            let params = {
                uid: bid,
                uname: userName,
                password: passWord,
                avatar, sex, tag, alias, sign,
                bigavatar: bigAvatar,
                createtime: createTime
            };
            if (birthday) params.birthday = birthday;
            let result = await mysqlInstance.INSERT('user', params, ctx);
            if (ctx.SQL_SUCCESS) {
                ctx.body = {
                    code: 0,
                    result: result
                };
            }
        }
    } else {
        ctx.body = {
            code: -501,
            message: '参数错误'
        };
    }
});

module.exports = route;
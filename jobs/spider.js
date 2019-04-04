const axios = require('axios');
const CronJob = require('cron').CronJob;
const uuid = require('uuid/v4');
const cheerio = require('cheerio');
const mysqlInstance = require('../common/mysql');
const { formatTime } = require('../common/utils');
let isRunning = false;

const SOURCES = [{
    source: '掘金',
    type: 'ajax',
    url: 'https://timeline-merger-ms.juejin.im/v1/get_tag_entry',
    params: {
        src: 'web',
        tagId: '5a96291f6fb9a0535b535438',
        page: 0,
        pageSize: 10,
        sort: 'rankIndex'
    },
    listKey: 'd.entrylist',
    map: {
        link: 'originalUrl',
        title: 'title',
        evaluate: 'summaryInfo',
        tags: '[tags].title',
        cover: 'screenshot',
        hot: 'hotIndex'
    }
}, {
    source: '简书',
    type: 'html',
    url: 'https://www.jianshu.com/c/ebc9d2e84214',
    params: {
        order_by: 'top',
        _pjax: '#list-container'
    }
}];

const ajaxSpiderHandler = async (info) => {
    try {
        let response = await axios({
            method: 'get',
            url: info.url,
            params: info.params
        });
        let res = response.status === 200 && response.data ? response.data : {};
        let keySplit = info.listKey.split('.');
        keySplit.forEach(key => {
            res = res[key] || {};
        });
        if (res instanceof Array) {
            await res.map(async item => {
                let ctx = {};
                let params = {};
                for (let k in info.map) {
                    if (info.map.hasOwnProperty(k)) {
                        if (info.map[k].indexOf('.') > -1) {
                            let keys = info.map[k].split('.');
                            let cache = Object.assign({}, item);
                            if (/^\[(.*)\]$/.test(keys[0])) {
                                let j = keys[0].replace(/(\[|\])/g, '');
                                cache = cache[j].map(sub => {
                                    return sub[keys[1]];
                                }).join(',');
                            } else {
                                keys.forEach(j => {
                                    cache = cache[j];
                                });
                            }
                            params[k] = cache;
                        } else {
                            let value = item[info.map[k]];
                            if (k === 'hot') {
                                value = Math.round(value * 100);
                            } else if (k === 'title' || k === 'cover') {
                                value = value.substr(0, 100);
                            } else if (k === 'link' || k === 'evaluate') {
                                value = value.substr(0, 200);
                            }
                            params[k] = value;
                        }
                    }
                }
                params.id = uuid().replace(/-/g, '');
                params.source = info.source;
                params.create_at = formatTime(new Date());
                let select = await mysqlInstance.SELECT('article_to_read', {
                    where: {
                        title: params.title,
                        source: params.source
                    }
                }, ctx);
                if (ctx.SQL_SUCCESS && select && select.length === 0) {
                    await mysqlInstance.INSERT('article_to_read', params, ctx);
                    if (!ctx.SQL_SUCCESS) {
                        console.log(ctx);
                    }
                }
            });
        }
    } catch (e) {
        console.log(e.message);
    }
};
const htmlSpiderHandler = async info => {
    try {
        let response = await axios({
            method: 'get',
            url: info.url,
            params: info.params
        });
        let htmlStr = response.status === 200 && response.data ? response.data : '';
        if (htmlStr) {
            const $ = cheerio.load(htmlStr);
            const $list = $('html').find('ul.note-list li');
            for (let i = 0; i < $list.length; i++) {
                let ctx = {};
                let item = $list[i];
                let $title = $(item).find('a.title');
                let link = $title.attr('href');
                if (link.indexOf('/') === 0) {
                    link = `https://www.jianshu.com${link}`;
                }
                let title = $title.text() || '';
                title = title.replace(/(\s|\n|\t|\r)/g, '');
                if (title.length > 100) {
                    title = title.substr(0, 100);
                }
                let cover = $(item).find('.wrap-img img').attr('src') || '';
                if (cover && !/^http(s)?:.*/.test(cover)) {
                    cover = `https:${cover}`;
                }
                if (cover.length > 100) {
                    cover = cover.substr(0, 100);
                }
                let evaluate = $(item).find('.abstract').text() || '';
                evaluate = evaluate.replace(/(\s|\n|\t|\r)/g, '');
                if (evaluate.length > 200) {
                    evaluate = evaluate.substr(0, 200);
                }
                let hot = $(item).find('.jsd-meta').text() || '';
                hot = hot.replace(/(\s|\n|\t|\r)/g, '');
                if (hot && !isNaN(hot)) {
                    hot = Number(hot) * 100;
                } else {
                    hot = 0;
                }
                const tags = 'Flutter';
                let params = { link, cover, title, evaluate, hot, tags };
                params.id = uuid().replace(/-/g, '');
                params.source = info.source;
                params.create_at = formatTime(new Date());
                let select = await mysqlInstance.SELECT('article_to_read', {
                    where: {
                        title: params.title,
                        source: params.source
                    }
                }, ctx);
                if (ctx.SQL_SUCCESS && select && select.length === 0) {
                    await mysqlInstance.INSERT('article_to_read', params, ctx);
                    if (!ctx.SQL_SUCCESS) {
                        console.log(ctx);
                    }
                }
            }
        }
    } catch (e) {
        console.log(e.message);
    }
};
const start = async () => {
    let isExsit = await mysqlInstance.EXIST_TABLE('article_to_read');
    if (!isExsit) {
        let ctx = {};
        await mysqlInstance.CREATE_SPIDER(ctx);
    }
    for (let i = 0; i < SOURCES.length; i++) {
        let item = SOURCES[i];
        if (item.type === 'ajax') {
            await ajaxSpiderHandler(item);
        } else {
            await htmlSpiderHandler(item);
        }
    }
};
const JOB = new CronJob({
    cronTime: '0 0 */12 * * *', // s m h d M week
    onTick: async () => {
        if (!isRunning) {
            isRunning = true;
            await start();
            isRunning = false;
        }
        console.log(`spider job tick at ${new Date().toISOString()}`);
    },
    start: false,
    timeZone: 'Asia/Shanghai'
});
JOB.start();
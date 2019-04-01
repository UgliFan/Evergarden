const axios = require('axios');
const CronJob = require('cron').CronJob;
const uuid = require('uuid/v4');
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
                        title: params.title
                    }
                }, ctx);
                if (ctx.SQL_SUCCESS && select && select.length === 0) {
                    let insert = await mysqlInstance.INSERT('article_to_read', params, ctx);
                    if (ctx.SQL_SUCCESS) {
                        console.log(insert);
                    } else {
                        console.log(ctx);
                    }
                }
            });
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
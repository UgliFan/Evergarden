const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

const formatTime = (date) => {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();
    if (month < 10) month = `0${month}`;
    if (day < 10) day = `0${day}`;
    if (hour < 10) hour = `0${hour}`;
    if (minute < 10) minute = `0${minute}`;
    if (second < 10) second = `0${second}`;
    return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
};

const formatSqlWhere = (params) => {
    let temp = [];
    for (let k in params) {
        if (params.hasOwnProperty(k) && params[k] !== undefined) {
            if (typeof params[k] === 'string') {
                temp.push(`${k}='${params[k]}'`);
            } else {
                temp.push(`${k}=${params[k]}`);
            }
        }
    }
    return temp.join(' and ');
};

const formatSqlInsert = (params) => {
    let temp = [];
    for (let k in params) {
        if (params.hasOwnProperty(k) && params[k] !== undefined) {
            if (typeof params[k] === 'string') {
                temp.push(`${k}='${params[k]}'`);
            } else {
                temp.push(`${k}=${params[k]}`);
            }
        }
    }
    return temp.join(',');
};

const getIp = (req) => {
    let ip = req.headers['x-real-ip'] ? req.headers['x-real-ip'] : (req.ip ? req.ip.replace(/::ffff:/, '') : '0.0.0.0');
    return ip;
};

module.exports = {
    formatTime, formatSqlWhere, formatSqlInsert, weeks, getIp
};
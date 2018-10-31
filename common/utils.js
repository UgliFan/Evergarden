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

module.exports = {
    formatTime, formatSqlWhere, formatSqlInsert
};
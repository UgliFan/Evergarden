const mysql = require('mysql');
const utils = require('./utils');

const pool = mysql.createPool({
    connectionLimit: 50,
    host: process.env.NODE_MYSQL_HOST,
    user: process.env.NODE_MYSQL_USER,
    password: process.env.NODE_MYSQL_PASSWORD,
    database: 'EVERGARDEN',
    port: 3306,
    multipleStatements: true
});
// The pool will emit an acquire event when a connection is acquired from the pool.
// This is called after all acquiring activity has been performed on the connection,
// right before the connection is handed to the callback of the acquiring code.
pool.on('acquire', connection => {
    console.log('Connection %d acquired', connection.threadId);
});

const query = (sql, ctx) => {
    if (ctx) ctx.SQL_SUCCESS = true;
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                reject(err);
            } else {
                connection.query(sql, (error, res) => {
                    connection.release();
                    if (error) {
                        reject(error);
                    } else {
                        resolve(res);
                    }
                });
            }
        });
    });
};

const existTable = async (tableName) => {
    try {
        let result = await query(`show tables like '${tableName}'`);
        return result.length > 0;
    } catch (e) {
        return false;
    }
};

const select = async (tableName, params = {}, ctx) => {
    let columns = params.columns || ['*'];
    let sql = `select ${columns.join(',')} from ${tableName}`;
    if (params.where) {
        let whereFormat = utils.formatSqlWhere(params.where);
        sql += ` where ${whereFormat}`;
    }
    try {
        return await query(sql, ctx);
    } catch (e) {
        ctx.SQL_SUCCESS = false;
        ctx.body = {
            code: -500,
            message: e.message || '内部错误'
        };
    }
};

const insert = async (tableName, params = {}, ctx) => {
    let format = utils.formatSqlInsert(params);
    let sql = `insert into ${tableName} set ${format}`;
    try {
        return await query(sql, ctx);
    } catch (e) {
        ctx.SQL_SUCCESS = false;
        ctx.body = {
            code: -500,
            message: e.message || '内部错误'
        };
    }
};

module.exports = {
    SELECT: select,
    INSERT: insert,
    EXIST_TABLE: existTable
};
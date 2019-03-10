const mysql = require('mysql');
const utils = require('./utils');
const sqlCommand = require('../dao/sql-command');

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
                console.log(err);
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

const matchTables = async str => {
    try {
        return await query(`show tables like '${str}'`);
    } catch (e) {
        return [];
    }
}

const createTally = async (tableName, ctx) => {
    let sql = sqlCommand.TALLY(tableName);
    try {
        await query(sql, ctx);
    } catch (e) {
        ctx.SQL_SUCCESS = false;
        ctx.body = {
            code: -500,
            message: e.message || '内部错误'
        };
    }
};
const createCategory = async (ctx) => {
    let sql = sqlCommand.CATEGORIES();
    try {
        await query(sql, ctx);
    } catch (e) {
        ctx.SQL_SUCCESS = false;
        ctx.body = {
            code: -500,
            message: e.message || '内部错误'
        };
    }
};

const select = async (tableName, params, ctx) => {
    if (!params) params = {};
    let columns = params.columns || ['*'];
    let sql = `select ${columns.join(',')} from ${tableName}`;
    if (params.join) {
        params.join.forEach(item => {
            sql += ` left join ${item.tb} on ${tableName}.${item.leftKey}=${item.tb}.${item.rightKey}`;
        })
    }
    if (params.where) {
        let whereFormat = utils.formatSqlWhere(params.where);
        sql += ` where ${whereFormat}`;
    }
    if (params.groupBy) {
        sql += ` group by ${params.groupBy}`;
    }
    if (params.order) {
        sql += ` order by ${params.order.key} ${params.order.type}`;
    }
    if (params.limit) {
        sql += ` limit ${params.limit.start},${params.limit.length}`;
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

const update = async (tableName, params = {}, ctx) => {
    let formatWhere = utils.formatSqlWhere(params.where);
    let formatValues = utils.formatSqlInsert(params.values);
    let sql = `update ${tableName} set ${formatValues} where ${formatWhere}`;
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

const del = async (tableName, params = {}, ctx) => {
    let formatWhere = utils.formatSqlWhere(params.where);
    let sql = `delete from ${tableName} where ${formatWhere}`;
    try {
        return await query(sql, ctx);
    } catch (e) {
        ctx.SQL_SUCCESS = false;
        ctx.body = {
            code: -500,
            message: e.message || '内部错误'
        };
    }
}

module.exports = {
    SELECT: select,
    INSERT: insert,
    UPDATE: update,
    DELETE: del,
    EXIST_TABLE: existTable,
    MATCH_TABLE: matchTables,
    CREATE_TALLY: createTally,
    CREATE_CATEGORY: createCategory
};
const mysql = require('mysql');
const mysqlConfig = require('./config').mysql;

const pool = mysql.createPool({
    connectionLimit: 50,
    host: mysqlConfig.host,
    user: mysqlConfig.user,
    password: mysqlConfig.password,
    database: 'EVERGARDEN',
    port: mysqlConfig.port,
    multipleStatements: true
});
// The pool will emit an acquire event when a connection is acquired from the pool.
// This is called after all acquiring activity has been performed on the connection,
// right before the connection is handed to the callback of the acquiring code.
pool.on('acquire', connection => {
    console.log('Connection %d acquired', connection.threadId);
});

const query = (sql, ...params) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                reject(err);
            } else {
                connection.query(sql, params, (error, res) => {
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

module.exports = {
    QUERY: query
};
const mysql = require('mysql');

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
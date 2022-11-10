const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'sql12.freesqldatabase.com',
    user: 'sql12537960',
    password: 'PJvRDKSlfn',
    database: 'sql12537960'
});

module.exports = db;
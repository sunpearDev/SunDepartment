const mysql = require('mysql')

//create connect to msql
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    port: 3306,
    database: 'sun_department'
})

module.exports = connection
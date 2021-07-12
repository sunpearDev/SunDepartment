const mysql = require('mysql')

//create connect to msql
const connection = mysql.createConnection({
    host: 'bgln0iskewmff7ykixfa-mysql.services.clever-cloud.com',
    user: 'u2ogpsmix7fcivpq',
    password: 'ZLHJm8Ujnol4fRyW5g1A',
    port: 3306,
    database: 'bgln0iskewmff7ykixfa'
})

module.exports = connection
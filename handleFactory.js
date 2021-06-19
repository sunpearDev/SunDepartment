const connect = require('./connection.js')
const { promisify } = require("util");
const jwt = require("jsonwebtoken");

const standardDataType = (text) => {
    if (!isNaN(text))
        return text
    else return `'${text}'`
}
const decodeToken = async (token) => {
    try {
        const decoded = await promisify(jwt.verify)(
            token,
            process.env.JWT_SECRET
        )
        return decoded.id
    }
    catch (err) {
        console.log(err)
        return undefined
    }
}
exports.getCurrentDate = () => {
    let today = new Date();
    let date = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
    let time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`
    let datetime = date + ' ' + time
    return datetime
}

exports.query = (sql) => {
    return new Promise((resolve, reject) => {
        connect.query(sql, async (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        })
    })
}

exports.getAccountID = async (token) => {
    let id = await decodeToken(token)
    return id
}

exports.validUser = async (token) => {
    let id = await decodeToken(token)
    return await this.getBy('account', { account_ID: id })
        .then(result =>
            ({ status: true, account_category: result[0].category_ID })
        )
        .catch(err =>
            ({ status: false, message: err.sqlMessage })
        )
}

exports.getAll = (table) => {
    return new Promise((resolve, reject) => {
        connect.query('select * from ' + table, async (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        })
    })
}


exports.getBy = (table, params, condition = 'and', correct = true) => {
    let sql = `select * from ${table} where `

    let keys = Object.keys(params)

    if (correct) {
        sql += `${keys[0]} = ` + standardDataType(params[keys[0]])
    } else {
        sql += `${keys[0]} like '%${params[keys[0]]}%'`
    }

    for (let i = 1; i < keys.length; i++) {
        sql += ` ${condition} ${keys[i]}`
        if (correct) {
            sql += ' = ' + standardDataType(params[keys[i]])
        } else {
            sql += ` like '%${params[keys[i]]}%'`
        }
    }


    return new Promise((resolve, reject) => {
        connect.query(sql, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        })
    })
}
exports.joinTables = (tables, id) => {
    let key = Object.keys(id)[0]
    let sql = `select * from ${tables[0]} join ${tables[1]} on ${tables[0]}.${key}=${tables[1]}.${key}`


    for (let i = 2; i < tables.length; i += 2) {
        sql += ` ${tables[i]} on ${tables[i - 1]}.${key}=${tables[i]}.${key}`
    }

    if (id[key] !== undefined)
        sql += ` where ${key} = ` + standardDataType(id[key])


    return new Promise((resolve, reject) => {
        connect.query(sql, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        })
    })
}


exports.createOne = async (table, item) => {

    return new Promise((resolve, reject) => {
        connect.query(`insert into ${table} set ? `, item, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        })
    })



}


exports.updateOne = (table, id, item) => {
    let keys = Object.keys(id)
    let params = `${keys[0]} = ` + standardDataType(id[keys[0]])

    for (let i = 1; i < keys.length; i++) {
        params += ` and ${keys[i]} = ` + standardDataType(id[keys[i]])
    }
    return new Promise((resolve, reject) => {
        connect.query(`update ${table} set ? where ${params}`, item, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        })
    })
}


exports.deleteBy = (table, id) => {
    let keys = Object.keys(id)
    let params = `${keys[0]} = ` + standardDataType(id[keys[0]])

    for (let i = 1; i < keys.length; i++) {
        params += ` and ${keys[i]} = ` + standardDataType(id[keys[i]])
    }
    return new Promise((resolve, reject) => {
        connect.query(`delete from ${table} where ${params}`, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        })
    })
}





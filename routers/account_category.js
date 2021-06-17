const express = require('express')
const router = express.Router()
const uniqid = require('uniqid')
const handleFactory = require('../handleFactory.js');
const AccountCategory = 'account_category'

router.post('/', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'nhansu' || category === 'admin')
        handleFactory.getAll(AccountCategory).then((data) => {
            if (category === 'nhansu')
                res.json({ status: true, categorys: data.slice(2) })
            else if (category === 'admin')
                res.json({ status: true, categorys: data.slice(1) })
        })
            .catch(err => {
                res.json({ status: false, message: err.sqlMessage })
            })

})
module.exports = router
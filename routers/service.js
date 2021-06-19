const express = require('express')
const router = express.Router()
const uniqid = require('uniqid')
const handleFactory = require('../handleFactory.js');
const Service = 'service'
const Account = 'account'

router.post('/getAll', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'admin' || category === 'letan') {
        handleFactory.getAll(Service).then(async (data) => {
            let list = data
            for (let i = 0; i < list.length; i++) {
                await handleFactory.getBy(Account, { account_ID: list[i].account_ID }).then(result => {
                    list.username = result[0].username;
                })
            }
            res.json({ status: true, list: list })
        })
            .catch(err => {
                res.json({ status: false, message: err.sqlMessage })
            })
    }
    else if (category === 'dichvu') {
        handleFactory.getBy(Service, { account_ID: await handleFactory.getAccountID() }).then((data) => {
            res.json({ status: true, list: data })
        })
            .catch(err => {
                res.json({ status: false, message: err.sqlMessage })
            })
    }

})
router.post('/find', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'admin' || category === 'letan') {
        handleFactory.getBy(Service, {
            service_ID: req.body.findText,
            service_name: req.body.findText,
            description: req.body.findText,
            state: req.body.findText,
            price: req.body.findText,
        }, 'or', false).then(result => res.json({ status: true, list: result }))
            .catch(err => {
                res.json({ status: false, message: err.sqlMessage })
            })
    }
})

router.post('/', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'admin') {
        let service = {
            service_ID: uniqid.time(),
            account_ID: req.body.account_ID,
            service_name: req.body.service_name,
            description: req.body.description,
            price: req.body.price,
        }
        handleFactory.createOne(Service, service).then(result => {
            res.json({ status: true })
        }).catch(err => {
            res.json({ status: false, message: err.sqlMessage })
        })
    }
})
router.put('/:id', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'admin' || category === 'dichvu') {
        handleFactory.updateOne(Service, { service_ID: req.params.id }, req.body.data)
            .then(result => res.json({ status: true }))
            .catch(err => {
                res.json({ status: false, message: err.sqlMessage })
            })
    }
})

router.delete('/:id/:jwt', async (req, res) => {
    let valid = await handleFactory.validUser(req.params.jwt)
    let category = valid.account_category
    if (category === 'admin')
        handleFactory.deleteBy(Service, { service_ID: req.params.id })
            .then(result => res.json({ status: 'success' }))
            .catch(err => {
                res.json({ status: false, message: err.sqlMessage })
            })
})
module.exports = router
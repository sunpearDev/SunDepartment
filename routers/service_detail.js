const express = require('express')
const router = express.Router()
const uniqid = require('uniqid')
const handleFactory = require('../handleFactory.js');
const ServiceDetail = 'service_detail'
const Service = 'service'
const Account = 'account'

router.post('/getAll', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'admin' || category === 'letan') {
        handleFactory.getAll(ServiceDetail).then(async (data) => {
            let list = []
            if (category === 'letan')
                list = data.filter(item => item.state === 'availabled')
            else list = data
            res.json({ status: true, list: list })
        })
            .catch(err => {
                res.json({ status: false, message: err.sqlMessage })
            })
    }
    else if (category === 'dichvu') {
        handleFactory.joinTables([Service, ServiceDetail], { service_ID: undefined }).then((data) => {
            let result = []
            data.map(async item => {
                if (item.account_ID === await handleFactory.getAccount(req.body.jwt))
                    result.push(item)
            })
            res.json({ status: true, list: result })
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
        handleFactory.getBy(ServiceDetail, {
            service_ID: req.body.findText,
            service_detail_ID: req.body.findText,
            price: req.body.findText,
            total_pay: req.body.findText,
        }, 'or', false).then(result => res.json({ status: true, list: result }))
            .catch(err => {
                res.json({ status: false, message: err.sqlMessage })
            })
    }
    else if (category === 'dichvu') {
        handleFactory.getBy(Service, { account_ID: await handleFactory.getAccountID(req.body.jwt) }).then(result => {
            let service_ID = result[0].service_ID
            handleFactory.getBy(ServiceDetail, {
                service_ID: req.body.findText,
                service_detail_ID: req.body.findText,
                price: req.body.findText,
                total_pay: req.body.findText,
            }, 'or', false).then(result => {
                let list = []
                result.map(item => {
                    if (item.service_ID === service_ID)
                        list.push(item)
                })
                res.json({ status: true, list: list })
            })
                .catch(err => {
                    res.json({ status: false, message: err.sqlMessage })
                })
        }).catch(err => res.json({ status: false, message: err.sqlMessage }))
    }
})
router.post('/detail', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'admin') {
        handleFactory.getBy(Service, { service_ID: req.body.value }).then(result => res.json({ status: true, list: result }))
            .catch(err => {
                res.json({ status: false, message: err.sqlMessage })
            })
    }else if (category === 'dichvu') {
        handleFactory.getBy(Service, { account_ID: await handleFactory.getAccountID(req.body.jwt) }).then(result => {
            let service_ID = result[0].service_ID
            handleFactory.getBy(ServiceDetail, { service_ID: service_ID }).then(result => {
                let list = []
                result.map(item => {
                    if (item.service_ID === service_ID)
                        list.push(item)
                })
                res.json({ status: true, list: list })
            })
                .catch(err => {
                    res.json({ status: false, message: err.sqlMessage })
                })
        }).catch(err => res.json({ status: false, message: err.sqlMessage }))
    }
})

router.post('/', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'admin' || category === 'dichvu' || category === 'letan') {
        console.log(req.body.order_detail_ID)
        let service = await handleFactory.getBy(Service, { service_ID: req.body.service_ID })
        let service_detail = {
            service_detail_ID: uniqid.time(),
            service_ID: req.body.service_ID,
            order_detail_ID: req.body.order_detail_ID,
            quantity: req.body.quantity,
            price: service[0].price,
            total_pay: req.body.quantity * service[0].price,
        }
        handleFactory.createOne(ServiceDetail, service_detail).then(result => {
            res.json({ status: true })
        }).catch(err => {
            res.json({ status: false, message: err.sqlMessage })
        })
    }
})
router.delete('/:id/:jwt', async (req, res) => {
    let valid = await handleFactory.validUser(req.params.jwt)
    let category = valid.account_category
    if (category === 'admin' || category === 'dichvu' || category === 'letan')
        handleFactory.deleteBy(ServiceDetail, { service_detail_ID: req.params.id })
            .then(result => res.json({ status: 'success' }))
            .catch(err => {
                res.json({ status: false, message: err.sqlMessage })
            })
})
module.exports = router
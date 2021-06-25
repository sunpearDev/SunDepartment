const express = require('express')
const router = express.Router()
const uniqid = require('uniqid')
const handleFactory = require('../handleFactory.js');
const Customer = 'customer'

router.post('/getAll', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'letan' || category === 'kinhdoanh' || category === 'admin')
        handleFactory.getAll(Customer).then((data) => {
            res.json({ status: true, list: data })
        })
            .catch(err => {
                res.json({ status: false, message: err.sqlMessage })
            })

})
router.post('/find', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'kinhdoanh' || category === 'letan' || category == "admin") {
        handleFactory.getBy(Customer, {
            customer_name: req.body.findText,
            age: req.body.findText,
            phone_number: req.body.findText,
            gender: req.body.findText,
            identify_number: req.body.findText
        }, 'or', false).then(result => res.json({ status: true, list: result }))
            .catch(err => {
                res.json({ status: false, message: err.sqlMessage })
            })
    }
})
router.post('/detail', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'kinhdoanh' || category === 'letan' || category == "admin") {
        handleFactory.getBy(Customer, { customer_ID: req.body.value }).then(result => res.json({ status: true, list: result }))
            .catch(err => {
                res.json({ status: false, message: err.sqlMessage })
            })
    }
})

router.post('/', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'kinhdoanh' || category === 'letan' || category == "admin") {
        let customer = {
            customer_ID: uniqid.time(),
            customer_name: req.body.customer_name,
            age: req.body.age,
            phone_number: req.body.phone_number,
            gender: req.body.gender,
            identify_number: req.body.identify_number
        }
        handleFactory.createOne(Customer, customer).then(result => {
            res.json({ status: true })
        }).catch(err => {
            res.json({ status: false, message: err.sqlMessage })
        })
    }
})
router.put('/:id', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'kinhdoanh' || category === 'letan' || category == "admin") {

        handleFactory.updateOne(Customer, { customer_ID: req.params.id }, req.body.data)
            .then(result => res.json({ status: true }))
            .catch(err => {
                res.json({ status: false, message: err.sqlMessage })
            })
    }
})
router.delete('/:id/:jwt', async (req, res) => {
    let valid = await handleFactory.validUser(req.params.jwt)
    let category = valid.account_category
    if (category === 'kinhdoanh' || category === 'admin')
        handleFactory.deleteBy(Customer, { customer_ID: req.params.id })
            .then(result => res.json({ status: 'success' }))
            .catch(err => {
                res.json({ status: false, message: err.sqlMessage })
            })
})
module.exports = router

const express = require('express')
const router = express.Router()
const uniqid = require('uniqid')
const handleFactory = require('../handleFactory.js');
const DepartmentSupply = 'department_supply'
const SupplyCategory = 'supply_category'


router.post('/getAll', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'ketoan' || category === 'admin' || category === 'kithuat') {
        handleFactory.getAll(DepartmentSupply).then(data => {

            res.json({ status: true, list: data })
        }).catch(err => {
            res.json({ status: false, message: err.sqlMessage })
        })
    }
})
router.post('/find', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'ketoan' || category === 'admin') {
        handleFactory.getBy(DepartmentSupply, {
            supply_category_ID: req.body.findText,
            supply_category_name: req.body.findText,
            supply_ID: req.body.findText,
            supply_name: req.body.findText,
            state: req.body.findText,
        }, 'or', false).then(result => res.json({ status: true, list: result }))
            .catch(err => {
                res.json({ status: false, message: err.sqlMessage })
            })
    }
})
router.post('/', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if ( category === 'admin') {
        let department_supply = {
            supply_category_ID: req.body.supply_category_ID,
            supply_ID: uniqid.time(),
            supply_name: req.body.supply_name,
            state: 'working',
        }
        handleFactory.createOne(DepartmentSupply, department_supply).then(result => {
            res.json({ status: true })
        }).catch(err => {
            res.json({ status: false, message: err.sqlMessage })
        })
    }
})
router.put('/:id', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'kithuat' || category === 'admin') {
        handleFactory.updateOne(DepartmentSupply, { supply_ID: req.params.id }, req.body.data)
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
        handleFactory.deleteBy(DepartmentSupply, { supply_ID: req.params.id })
            .then(result => res.json({ status: 'success' }))
            .catch(err => {
                res.json({ status: false, message: err.sqlMessage })
            })
})
module.exports = router
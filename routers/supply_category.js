const express = require('express')
const router = express.Router()
const uniqid = require('uniqid')
const handleFactory = require('../handleFactory.js');
const SupplyCategory = 'supply_category'
const RoomSupply = 'room_supply'
const DepartmentSupply = 'department_supply'

router.post('/getAll', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'ketoan' || category === 'admin')
        handleFactory.getAll(SupplyCategory).then((data) => {
            res.json({ status: true, list: data })
        })
            .catch(err => {
                res.json({ status: false, message: err.sqlMessage })
            })

})
router.post('/find', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'ketoan' || category === 'admin') {
        handleFactory.getBy(SupplyCategory, {
            supply_category_ID: req.body.findText,
            supply_category_name: req.body.findText,
            supply_type: req.body.findText
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
        let supply_category = {
            supply_category_ID: uniqid.time(),
            supply_category_name: req.body.supply_category_name,
            supply_type: req.body.supply_type
        }
        handleFactory.createOne(SupplyCategory, supply_category).then(result => {
            res.json({ status: true })
        }).catch(err => {
            res.json({ status: false, message: err.sqlMessage })
        })
    }
})
router.put('/:id', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category == "admin") {
        handleFactory.updateOne(SupplyCategory, { supply_category_ID: req.params.id }, req.body.data)
            .then(result => res.json({ status: true }))
            .catch(err => {
                res.json({ status: false, message: err.sqlMessage })
            })
    }
})
router.delete('/:id/:jwt', async (req, res) => {
    let valid = await handleFactory.validUser(req.params.jwt)
    let category = valid.account_category
    if (category === 'admin') {
        let room_supplys = await handleFactory.getBy(RoomSupply, { supply_category_ID: req.params.id })
        let department_supplys = await handleFactory.getBy(DepartmentSupply, { supply_category_ID: req.params.id })
        if (room_supplys.length > 0 || department_supplys.length > 0) res.json({ status: false, message: 'Vi phạm ràn buộc' })
        else
            handleFactory.deleteBy(SupplyCategory, { supply_category_ID: req.params.id })
                .then(result => res.json({ status: 'success' }))
                .catch(err => {
                    res.json({ status: false, message: err.sqlMessage })
                })
    }

})
module.exports = router
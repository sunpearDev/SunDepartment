const express = require('express')
const router = express.Router()
const uniqid = require('uniqid')
const handleFactory = require('../handleFactory.js');
const RoomSupply = 'room_supply'
const SupplyCategory = 'supply_category'
const Room = 'room'
const RoomCategory = 'room_category'

router.post('/getAll', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'ketoan' || category === 'admin' || category === 'kithuat') {
        handleFactory.getAll(RoomSupply).then(data => {
            res.json({ status: true, list: data })
        }).catch(err => {
            res.json({ status: false, message: err.sqlMessage })
        })
    }
})
router.post('/find', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'ketoan' || category === 'admin' || category === 'kithuat') {
        handleFactory.getBy(RoomSupply, {
            supply_category_ID: req.body.findText,
            supply_category_name: req.body.findText,
            supply_ID: req.body.findText,
            supply_name: req.body.findText,
            room_category_ID: req.body.findText,
            room_number: req.body.findText,
            room_category_name: req.body.findText,
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
    if (category === 'kithuat' || category === 'admin') {
        let ids = req.body.room_code.split('.')
        let room_supply
        if (req.body.supply_name === '' || req.body.supply_name === undefined) {
            let supply_ID = uniqid.time()
            let supply_category = await handleFactory.getBy(SupplyCategory, { supply_category_ID: req.body.supply_category_ID })
            room_supply = {
                supply_category_ID: req.body.supply_category_ID,
                supply_ID: supply_ID,
                supply_name: supply_category[0].supply_category_name + ' ' + req.body.room_code,
                room_category_ID: ids[0],
                room_number: ids[1],
                state: 'working',
            }
        }
        else {
            room_supply = {
                supply_category_ID: req.body.supply_category_ID,
                supply_ID: uniqid.time(),
                supply_name: req.body.supply_name,
                room_category_ID: ids[0],
                room_number: ids[1],
                state: 'working',
            }
        }
        handleFactory.createOne(RoomSupply, room_supply).then(result => {
            res.json({ status: true })
        }).catch(err => {
            res.json({ status: false, message: err.sqlMessage })
        })

    }
})
router.put('/:id', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'kithuat' || category === "admin") {
        let data = req.body.data
        let room_supply = {
            supply_name: data.supply_name,
            room_category_ID: data.room_category_ID,
            room_number: data.room_number,
            state: data.state
        }
        
        handleFactory.updateOne(RoomSupply, { supply_ID: req.params.id }, room_supply)
            .then(result => res.json({ status: true }))
            .catch(err => {
                res.json({ status: false, message: err.sqlMessage })
            })
    }
})
router.delete('/:id/:jwt', async (req, res) => {
    let valid = await handleFactory.validUser(req.params.jwt)
    let category = valid.account_category
    if (category === 'kithuat' || category === 'admin')
        handleFactory.deleteBy(RoomSupply, { supply_ID: req.params.id })
            .then(result => res.json({ status: 'success' }))
            .catch(err => {
                res.json({ status: false, message: err.sqlMessage })
            })
})
module.exports = router
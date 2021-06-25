const express = require('express')
const router = express.Router()
const uniqid = require('uniqid')
const handleFactory = require('../handleFactory.js');
const RoomCategory = 'room_category'

router.post('/getAll', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'letan' || category === 'kinhdoanh' || category === 'admin')
        handleFactory.getAll(RoomCategory).then((data) => {
            res.json({ status: true, list: data })
        })
            .catch(err => {
                res.json({ status: false, message: err.sqlMessage })
            })

})
router.post('/find', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'kinhdoanh' || category === 'admin') {
        handleFactory.getBy(RoomCategory, {
            room_category_ID: req.body.findText,
            room_category_name: req.body.findText,
            single_bed: req.body.findText,
            double_bed: req.body.findText,
            area: req.body.findText,
            description: req.body.findText,
            price_on_day: req.body.findText
        }, 'or', false).then(result => res.json({ status: true, list: result }))
            .catch(err => {
                res.json({ status: false, message: err.sqlMessage })
            })
    }
})
router.post('/detail', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'kinhdoanh' || category === 'admin') {
        handleFactory.getBy(RoomCategory, { room_category_ID: req.body.value }).then(result => res.json({ status: true, list: result }))
            .catch(err => {
                res.json({ status: false, message: err.sqlMessage })
            })
    }
})

router.post('/', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'kinhdoanh' || category === 'admin') {
        let room_category = {
            room_category_ID: uniqid.time(),
            room_category_name: req.body.room_category_name,
            single_bed: req.body.single_bed,
            double_bed: req.body.double_bed,
            area: req.body.area,
            description: req.body.description,
            available: 0,
            price_on_day: req.body.price_on_day
        }
        handleFactory.createOne(RoomCategory, room_category).then(result => {
            res.json({ status: true })
        }).catch(err => {
            res.json({ status: false, message: err.sqlMessage })
        })
    }
})
router.put('/:id', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'kinhdoanh' || category == "admin") {
        handleFactory.updateOne(RoomCategory, { room_category_ID: req.params.id }, req.body.data)
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
        handleFactory.deleteBy(RoomCategory, { room_category_ID: req.params.id })
            .then(result => res.json({ status: 'success' }))
            .catch(err => {
                res.json({ status: false, message: err.sqlMessage })
            })
})
module.exports = router
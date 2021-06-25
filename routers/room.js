const express = require('express')
const router = express.Router()
const uniqid = require('uniqid')
const handleFactory = require('../handleFactory.js');
const connect = require('../connection')
const Room = 'room'
const RoomCategory = 'room_category'

router.post('/getAll', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'kinhdoanh' || category === 'admin')
        handleFactory.joinTables([Room, RoomCategory], { room_category_ID: undefined }).then((data) => {
            let result = []
            data.map(item => {
                result.push({
                    room_number: item.room_number,
                    room_category_ID: item.room_category_ID,
                    room_category_name: item.room_category_name,
                    state: item.state
                })
            })
            res.json({ status: true, list: result })
        })
            .catch(err => {
                res.json({ status: false, message: err.sqlMessage })
            })

})

router.post('/', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'kinhdoanh' || category === 'admin') {
        handleFactory.getBy(Room, { room_category_ID: req.body.room_category_ID })
            .then(result => {
                let room = {
                    room_number: result.length > 0 ? result[result.length - 1].room_number + 1 : 1,
                    room_category_ID: req.body.room_category_ID,
                    state: 'empty'
                }
                connect.beginTransaction((err) => {
                    if (err) {
                        connect.commit();
                        res.json({ status: false, message: err })
                    }
                    else {
                        handleFactory.createOne(Room, room).then(result => {
                            handleFactory.getBy(RoomCategory, { room_category_ID: room.room_category_ID }).then(result => {
                                let available = result[0].available
                                handleFactory.updateOne(RoomCategory, { room_category_ID: room.room_category_ID }, { available: available + 1 }).then(result => {
                                    connect.commit()
                                    res.json({ status: true })
                                }).catch(err => {
                                    connect.rollback()
                                    res.json({ status: false, message: err.sqlMessage })
                                })
                            }).catch(err => {
                                connect.rollback()
                                res.json({ status: false, message: err.sqlMessage })
                            })
                        }).catch(err => {
                            connect.rollback()
                            res.json({ status: false, message: err.sqlMessage })
                        })
                    }
                })
            }).catch(err => res.json({ status: false, message: err.sqlMessage }))

    }
})
router.post('/find', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'kinhdoanh' || category === 'admin') {
        handleFactory.getBy(Room, { room_category_ID: req.body.findText }).then(result => res.json({ status: true, list: result }))
            .catch(err => {
                res.json({ status: false, message: err.sqlMessage })
            })
    }
})
router.put('/:id', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category == "admin") {
        handleFactory.updateOne(Room, { room_number: req.params.id, room_category_ID: req.body.data.room_category_ID }, { state: req.body.data.state })
            .then(result => res.json({ status: true }))
            .catch(err => {
                res.json({ status: false, message: err.sqlMessage })
            })
    }
})
router.delete('/:id/:jwt', async (req, res) => {
    let valid = await handleFactory.validUser(req.params.jwt)
    let category = valid.account_category
    if (category === 'kinhdoanh' || category === 'admin') {
        let ids = req.params.id.split('.')
        connect.beginTransaction((err) => {
            if (err) {
                connect.commit();
                res.json({ status: false, message: err })
            }
            else {
                handleFactory.deleteBy(Room, { room_category_ID: ids[0], room_number: ids[1] })
                    .then(result => {
                        handleFactory.getBy(RoomCategory, { room_category_ID: ids[0] }).then(result => {
                            let available = result[0].available
                            handleFactory.updateOne(RoomCategory, { room_category_ID: ids[0] }, { available: available - 1 }).then(result => {
                                connect.commit()
                                res.json({ status: true })
                            }).catch(err => {
                                connect.rollback()
                                res.json({ status: false, message: err.sqlMessage })
                            })
                        }).catch(err => {
                            connect.rollback()
                            res.json({ status: false, message: err.sqlMessage })
                        })
                    }).catch(err => {
                        connect.rollback()
                        res.json({ status: false, message: err.sqlMessage })
                    })
            }
        })

    }
})

module.exports = router
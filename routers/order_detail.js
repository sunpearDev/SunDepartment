const express = require('express')
const router = express.Router()
const uniqid = require('uniqid')
const handleFactory = require('../handleFactory.js');
const connect = require('../connection');
const Mail = require('nodemailer/lib/mailer');
const Order = 'ordering'//MYSQL ÉO CHỊU TÊN BẢNG ORDER
const OrderDetail = 'order_detail'
const RoomCategory = 'room_category'
const Room = 'room'
const Service = 'service'
const ServiceDetail = 'service_detail'
const day = 86400000

router.post('/getAll', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'kinhdoanh' || category === 'admin')
        handleFactory.getAll(OrderDetail).then(async (data) => {
            let list = []
            for (let i = 0; i < data.length; i++) {
                let item = data[i]
                await handleFactory.getBy(RoomCategory, { room_category_ID: data[i].room_category_ID }).then(async (result) => {
                    list.push({
                        order_detail_ID: await item.order_detail_ID,
                        order_ID: item.order_ID,
                        room_number: item.room_number,
                        room_category_name: result[0].room_category_name,
                        check_in: item.check_in,
                        check_out: item.check_out,
                        price_on_day: item.price_on_day,
                        state: item.state,
                        customer_required: item.customer_required,
                        price_on_day: item.price_on_day,
                        total_pays: item.total_pays,
                    })
                }).catch(err => {
                    res.json({ status: false, message: err.sqlMessage })
                })
            }
            res.json({ status: true, list: list })
        })
            .catch(err => {
                res.json({ status: false, message: err.sqlMessage })
            })

})



router.put('/:id', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'kinhdoanh' || category === 'letan' || category === 'admin') {
        let order_detail = await handleFactory.getBy(OrderDetail, { order_detail_ID: req.params.id })
        if (order_detail[0].room_number !== req.body.room_number || order_detail[0].room_category_ID !== req.body.room_category_ID) {
            connect.beginTransaction(err => {
                if (err) {
                    connect.commit();
                    res.json({ status: false, message: err })
                }
                else {
                    handleFactory.updateOne(Room, { room_number: order_detail[0].room_number, room_category_ID: order_detail[0].room_category_ID }, { state: 'empty' }).then(async result => {
                        let room_category = await handleFactory.getBy(RoomCategory, { room_category_ID: order_detail[0].room_category_ID })

                        await handleFactory.updateOne(RoomCategory, { room_category_ID: order_detail[0].room_category_ID }, { available: (room_category.available + 1) }).catch(err => {
                            connect.rollback()
                            res.json({ status: false, message: err.sqlMessage })
                        })

                        await handleFactory.updateOne(OrderDetail, { order_detail_ID: req.params.id }, req.body.data).catch(err => {
                            connect.rollback()
                            res.json({ status: false, message: err.sqlMessage })
                        })

                        await handleFactory.updateOne(Room, { room_number: req.body.room_number, room_category_ID: req.body.room_category_ID }, { state: 'booked' }).then(async result => {

                            room_category = await handleFactory.getBy(RoomCategory, { room_category_ID: order_detail[0].room_category_ID })
                            handleFactory.updateOne(RoomCategory, { room_category_ID: order_detail[0].room_category_ID }, { available: (room_category.available - 1) }).then(result => {
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
        else {
            handleFactory.updateOne(OrderDetail, { order_detail_ID: req.params.id }, req.body.data).then(result => {
                res.json({ status: true })
            }).catch(err => {
                res.json({ status: false, message: err.sqlMessage })
            })
        }
    }
})
router.put('/check_in/:id', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'admin' || category === 'letan') {
        connect.beginTransaction(async err => {
            if (err) {
                connect.commit();
                res.json({ status: false, message: err })
            }
            else {
                handleFactory.updateOne(OrderDetail, { order_detail_ID: req.params.id }, { check_in: await handleFactory.getCurrentDate() }).then(result => {
                    handleFactory.getBy(OrderDetail, { order_detail_ID: req.params.id }).then(result => {
                        handleFactory.updateOne(Room, { room_number: result[0].room_number, room_category_ID: result[0].room_category_ID }, { state: 'using' }).then(result => {
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
router.put('/check_out/:id', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'admin' || category === 'letan') {
        connect.beginTransaction(async err => {
            if (err) {
                connect.commit();
                res.json({ status: false, message: err })
            }
            else {
                let time = await handleFactory.getCurrentDate()
                handleFactory.getBy(OrderDetail, { order_detail_ID: req.params.id }).then(async result => {
                    let order_detail = result[0]
                    let diffDate = Math.ceil((new Date(time) - new Date(order_detail.check_in)) / day)
                    let total_pays = diffDate * order_detail.price_on_day
                    await handleFactory.getBy(ServiceDetail, { order_detail_ID: req.params.id }).then(result => {
                        if (result.length > 0)
                            result.map(item => {
                                total_pays += item.total_pay
                            })
                    }).catch(err => {
                        connect.rollback()
                        res.json({ status: false, message: err.sqlMessage })
                    })
                    handleFactory.updateOne(OrderDetail, { order_detail_ID: req.params.id }, { check_out: time, state: 'prepare', total_pays: total_pays }).then(result => {
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
            }

        })
    }
})
router.put('/confirm_pay/:id', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'admin' || category === 'letan') {
        handleFactory.updateOne(OrderDetail, { order_detail_ID: req.params.id }, { state: 'paid' }).then(result => {
            res.json({ status: true })
        }).catch(err => {
            res.json({ status: false, message: err.sqlMessage })
        })
    }
})

router.post('/find', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'admin' || category === 'letan') {
        handleFactory.getBy(OrderDetail, {
            order_ID: req.body.findText,
            order_detail_ID: req.body.findText,
            room_number: req.body.findText,
            room_category_ID: req.body.findText,
            price_on_day: req.body.findText,
            customer_required: req.body.findText
        }, 'or', false).then(async data => {
            for (let i = 0; i < data.length; i++) {
                let item = data[i]
                await handleFactory.getBy(RoomCategory, { room_category_ID: data[i].room_category_ID }).then((result) => {
                    list.push({
                        order_detail_ID: item.order_detail_ID,
                        order_ID: item.order_ID,
                        room_number: item.room_number,
                        room_category_name: result[0].room_category_name,
                        check_in: item.check_in,
                        check_out: item.check_out,
                        price_on_day: item.price_on_day,
                        customer_required: item.customer_required,
                    })
                }).catch(err => {
                    res.json({ status: false, message: err.sqlMessage })
                })
            }
            res.json({ status: true, list: result })
        })
            .catch(err => {
                res.json({ status: false, message: err.sqlMessage })
            })
    }
})

router.delete('/:id/:jwt', async (req, res) => {
    let valid = await handleFactory.validUser(req.params.jwt)
    let category = valid.account_category
    if (category === 'admin') {

    }
})

module.exports = router
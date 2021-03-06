const express = require('express')
const router = express.Router()
const uniqid = require('uniqid')
const handleFactory = require('../handleFactory.js');
const connect = require('../connection')
const Order = 'ordering'//MYSQL ÉO CHỊU TÊN BẢNG ORDER
const OrderDetail = 'order_detail'
const RoomCategory = 'room_category'
const Room = 'room'
const Account = 'account'
const Customer = 'customer'
const ServiceDetail = 'service_detail'



router.post('/getAll', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'kinhdoanh' || category === 'letan' || category === 'admin') {
        handleFactory.query('SELECT * from ordering JOIN account ON ordering.account_ID=account.account_ID JOIN customer on ordering.customer_ID=customer.customer_ID').then(async result => {
            let list = result.filter(item =>
                category !== 'admin' ? item.state !== 'disable' : item
            )
            /*//TÁCH NHỮNG THÔNG TIN KHÔNG CẦN THIẾT
            for (let i = 0; i < list.length; i++) {
                //join table
                await handleFactory.query("SELECT * from order_detail join room on order_detail.room_number = room.room_number and order_detail.room_category_ID = room.room_category_ID JOIN room_category on room.room_category_ID = room_category.room_category_ID where order_ID = '" + list[i].order_ID + "'").then(result => {
                    list[i].ordertail = result
                }).catch(err => res.json({ status: false, message: err.sqlMessage }))
            }*/
            res.json({ status: true, list: list })
        }).catch(err => res.json({ status: false, message: err.sqlMessage }))

    }

})

router.post('/', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'kinhdoanh' || category === 'letan' || category == "admin") {
        try {
            connect.beginTransaction(async err => {
                if (err) {
                    connect.commit();
                    res.json({ status: false, message: err })
                }
                else {
                    let order = {
                        order_ID: uniqid.time(),
                        account_ID: await handleFactory.getAccountID(req.body.jwt),
                        customer_ID: req.body.customer_ID,
                        begin_stay_date: req.body.lenghtOfStay[0].split('T')[0],
                        end_stay_date: req.body.lenghtOfStay[1].split('T')[0],
                        adults: req.body.adults,
                        childrens: req.body.childrens,
                        state: 'pending',
                        customers_required: req.body.customers_required
                    }
                    handleFactory.createOne(Order, order).then(result => {
                        handleFactory.getAll(RoomCategory).then(async result => {
                            let order_room_category = []
                            for (let i = 0; i < result.length; i++) {
                                let item = result[i]
                                if (req.body[item.room_category_ID] > 0 && item.available >= req.body[item.room_category_ID]) {
                                    await order_room_category.push({ [item.room_category_ID]: req.body[item.room_category_ID], available: item.available, price_on_day: item.price_on_day })

                                }


                            }

                            if (order_room_category.length === 0) {
                                connect.rollback()
                                res.json({ status: false, message: 'Không thể không đặt gì cả' })
                            }
                            else {
                                var success = undefined
                                var success2 = undefined

                                for (let j = 0; j < order_room_category.length; j++) {
                                    var item = order_room_category[j]
                                    var key = Object.keys(item)[0]


                                    for (let i = item.available; i > (item.available - item[key]); i--) {
                                        console.log('meo2')
                                        let order_detail = {
                                            order_ID: order.order_ID,
                                            order_detail_ID: uniqid.time(),
                                            room_number: i,
                                            room_category_ID: key,
                                            price_on_day: item.price_on_day
                                        }
                                        await handleFactory.createOne(OrderDetail, order_detail).then(async result => {
                                            await handleFactory.updateOne(Room, { room_number: i, room_category_ID: key }, { state: 'booked' }).then(result => {

                                                success = true
                                                console.log(success)
                                            }).catch(err => {
                                                success = false
                                                connect.rollback()
                                                res.json({ status: false, message: 'Lỗi update phòng' })
                                            })
                                        }).catch(err => {
                                            success = false
                                            connect.rollback()
                                            res.json({ status: false, message: 'Lỗi tạo chi tiết đơn đặt' })
                                        })
                                    }



                                    if (success) {

                                        await handleFactory.updateOne(RoomCategory, { room_category_ID: key }, { available: item.available - item[key] }).then((result) => {
                                            success2 = true
                                        }).catch(err => {
                                            success2 = false
                                            connect.rollback()
                                            res.json({ status: false, message: 'Lỗi update loại phòng' })
                                        })
                                    }
                                }

                                if (success2) {

                                    connect.commit()
                                    res.json({ status: true })
                                }
                                else {
                                    connect.rollback()
                                    res.json({ status: false, message: 'success' })
                                }
                            }
                        }).catch(err => {
                            connect.rollback()
                            res.json({ status: false, message: 'Lỗi lấy danh sách loại phòng' })
                        })

                    }).catch(err => {
                        connect.rollback()
                        res.json({ status: false, message: 'Lỗi tạo đơn đặt' })
                    })
                }

            })
        } catch (err) {
            console.error(err)
        }

    }
})
router.post('/find', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'letan' || category === 'admin') {
        handleFactory.getBy(Order, {
            order_ID: req.body.findText,
            account_ID: req.body.findText,
            customer_ID: req.body.findText,
            begin_stay_date: req.body.findText,
            end_stay_date: req.body.findText,
            adults: req.body.findText,
            childrens: req.body.findText,
            state: req.body.findText,
        }, 'or', false).then(async result => {
            let list = result
            for (let i = 0; i < result.length; i++) {
                await handleFactory.getBy(Customer, { customer_ID: result[i].customer_ID }).then(data => {
                    list[i].customer_name = data[0].customer_name
                }).catch(err => {
                    res.json({ status: false, message: err.sqlMessage })
                })
            }
            res.json({ status: true, list: list })
        })
            .catch(err => {
                res.json({ status: false, message: err.sqlMessage })
            })
    }
})
router.post('/detail', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'letan' || category === 'admin') {
        handleFactory.getBy(Order, { order_ID: req.body.value }).then(result => res.json({ status: true, list: result }))
            .catch(err => {
                res.json({ status: false, message: err.sqlMessage })
            })
    }
})


router.put('/:id', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category == "admin") {
        order = {
            customer_ID: req.body.data.customer_ID,
            adults: req.body.data.adults,
            childrens: req.body.data.childrens,
            customers_required: req.body.data.customers_required,
        }
        handleFactory.updateOne(Order, { order_ID: req.params.id }, order)
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
        connect.beginTransaction(async err => {
            if (err) {
                connect.commit();
                res.json({ status: false, message: err })
            }
            else {
                let orderDetails = await handleFactory.getBy(OrderDetail, { order_ID: req.params.id })
                if (orderDetails.length === 0) {
                    handleFactory.deleteBy(Order, { order_ID: req.params.id }).then(result => {
                        connect.commit()
                        res.json({ status: true })
                    }).catch(err => {

                        connect.rollback()
                        res.json({ status: false, message: err.sqlMessage })
                    })
                }
                else {
                    handleFactory.getBy(OrderDetail, { order_ID: req.params.id }).then(async result => {
                        let success = undefined
                        for (let i = 0; i < result.length; i++) {
                            await handleFactory.deleteBy(ServiceDetail, { order_detail_ID: result[i].order_detail_ID }).then(result => {
                                success = true;
                            }).catch(err => {
                                success = false;
                                connect.rollback()
                                res.json({ status: false, message: err.sqlMessage })
                            })
                        }
                        if (success)
                            handleFactory.deleteBy(OrderDetail, { order_ID: req.params.id }).then(result => {
                                handleFactory.deleteBy(Order, { order_ID: req.params.id }).then(async result => {

                                    for (let i = 0; i < orderDetails.length; i++) {
                                        await handleFactory.updateOne(Room, { room_number: orderDetails[i].room_number, room_category_ID: orderDetails[i].room_category_ID }, { state: "empty" }).then(result => {
                                            success = true
                                        }).catch(err => {
                                            success = false
                                            connect.rollback()
                                            res.json({ status: false, message: err.sqlMessage })
                                        })
                                    }
                                    if (success) {
                                        success = undefined
                                        let room_categorys = []
                                        let availables = []
                                        orderDetails.forEach(item => {
                                            let position = room_categorys.indexOf(item.room_category_ID)
                                            if (room_categorys.length === 0) {
                                                room_categorys.push(item.room_category_ID)
                                                availables.push(1)
                                            } else if (position !== -1) {
                                                availables[position]++
                                            }
                                            else {
                                                room_categorys.push(item.room_category_ID)
                                                availables.push(1)
                                            }
                                        })
                                        for (let i = 0; i < room_categorys.length; i++) {
                                            let room_category = await (handleFactory.getBy(RoomCategory, { room_category_ID: room_categorys[i] }))

                                            await handleFactory.updateOne(RoomCategory, { room_category_ID: room_categorys[i] }, { available: room_category[0].available + availables[i] }).then((result) => {
                                                success = true
                                            }).catch(err => {
                                                success = false
                                                connect.rollback()
                                                res.json({ status: false, message: err.sqlMessage })
                                            })
                                        }
                                        if (success) {
                                            connect.commit()
                                            res.json({ status: true })
                                        }
                                        else {
                                            connect.rollback()
                                            res.json({ status: false, message: "Không xoá được" })
                                        }

                                    } else {
                                        connect.rollback()
                                        res.json({ status: success })
                                    }
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
            }
        })
    }
    else if (category === 'kinhdoanh') {
        handleFactory.updateOne(Order, { order_ID: req.params.id }, { state: 'disable' })
            .then(result => res.json({ status: true }))
            .catch(err => {
                res.json({ status: false, message: err.sqlMessage })
            })
    }
})

module.exports = router
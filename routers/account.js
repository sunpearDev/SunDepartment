const express = require('express')
const router = express.Router()
const uniqid = require('uniqid')
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const handleFactory = require('../handleFactory.js');
const Account = 'account'
var nodemailer = require('nodemailer');

const sendMail = (email, subject, text) => {
    const option = {
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_SENDER, // email hoặc username
            pass: process.env.PASSWORD_SENDER // password
        }
    };
    var transporter = nodemailer.createTransport(option);

    transporter.verify(function (error, success) {
        // Nếu có lỗi.
        if (error) {
            console.log(error);
            return false;
        } else { //Nếu thành công.
            console.log('Kết nối thành công!');
            var mail = {
                from: process.env.EMAIL_SENDER, // Địa chỉ email của người gửi
                to: email, // Địa chỉ email của người gửi
                subject: subject, // Tiêu đề mail
                text: text, // Nội dung mail dạng text
            };
            //Tiến hành gửi email
            transporter.sendMail(mail, function (error, info) {
                if (error) { // nếu có lỗi
                    console.log(error);
                    return false;
                } else { //nếu thành công
                    console.log('Email sent: ' + info.response);
                    return true
                }
            });
        }
    });
}


const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};


router.post('/getAll', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'admin' || category === 'nhansu')
        handleFactory.getAll(Account).then((data) => {
            let returns = []
            if (category === "nhansu") {
                returns = data.filter((value, index, arr) => {
                    value.password = undefined
                    return value.category_ID !== "nhansu" && value.account_category !== "admin"
                })
            }
            else if (category === "admin") {
                returns = data.filter((value, index, arr) => {
                    value.password = undefined
                    return value.category_ID !== "admin"
                })
            }
            res.json({ status: true, list: returns })
        })
            .catch(err => {
                res.json({ status: false, message: err.sqlMessage })
            })

})
router.post('/find', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'admin' || category === 'nhansu') {
        handleFactory.getBy(Account, {
            username: req.body.findText,
            email: req.body.findText,
            state: req.body.findText,
            category_ID: req.body.findText
        }, 'or', false).then(result => res.json({ status: true, list: result }))
            .catch(err => {
                res.json({ status: false, message: err.sqlMessage })
            })
    }
})

router.post('/', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'admin' || category === 'nhansu') {
        let account = {
            account_ID: uniqid.time(),
            username: req.body.username,
            email: req.body.email,
            password: uniqid.process(),
            state: 'new',
            category_ID: req.body.category_ID
        }
        handleFactory.createOne(Account, account).then(result => {
            let send = sendMail(account.email, 'KÍCH HOẠT TÀI KHOẢN', 'Truy cập http://localhost:3000/login/active và nhập  mã ' + account.password)
            res.json({ status: true })
        }).catch(err => {
            res.json({ status: false, message: err.sqlMessage })
        })
    }
})

router.post('/login', (req, res) => {
    handleFactory.getBy(Account, { username: req.body.username }).then(async results => {
        if (results.length > 0) {
            let account = results[0]
            switch (account.state) {
                case 'active':
                    if (await bcrypt.compare(req.body.password, account.password)) {
                        res.json({ status: true, token: createToken(account.account_ID), username: account.username })
                    }
                    else res.json({ status: false, message: 'Mật khẩu không đúng' })
                    break
                case 'new':
                    if (req.body.activeCode == account.password) {
                        if (req.body.newPassword === undefined)
                            res.json({ status: false, message: "Mật khẩu mới bị rỗng" })
                        else {
                            let changes = {
                                state: 'active',
                                password: await bcrypt.hash(req.body.newPassword, 12)
                            }
                            handleFactory.updateOne(Account, { account_ID: account.account_ID }, changes).then(result => res.json({ status: true, token: createToken(account.account_ID), username: req.body.username })).catch(err => res.json({ status: false, message: "err.sqlMessage" }))
                        }
                    }
                    break
                case 'disable':
                    res.json({ status: false, message: 'Tài khoản của bạn đã bị vô hiệu hoá' })
                    break
                default:
                    res.json({ status: false, message: 'Không xác định được trạng thái tài khoản' })
            }
        }
        else res.json({ status: false, message: 'Không tìm thấy ' + req.body.username })
    }).catch(err =>
        res.json({ status: false, message: err.sqlMessage })
    )
})
router.post('/valid', async (req, res) => {
    res.json(await handleFactory.validUser(req.body.jwt))
})
router.put('/:id', async (req, res) => {
    let valid = await handleFactory.validUser(req.body.jwt)
    let category = valid.account_category
    if (category === 'admin' || category === 'nhansu') {
        handleFactory.updateOne(Account, { account_ID: req.params.id }, req.body.data)
            .then(result => res.json({ status: result }))
            .catch(err => {
                res.json({ status: false, message: err.sqlMessage })
            })
    }
})
router.delete('/:id/:jwt', async (req, res) => {
    let valid = await handleFactory.validUser(req.params.jwt)
    let category = valid.account_category
    if (category === 'admin' || category === 'nhansu')
        handleFactory.deleteBy(Account, { account_ID: req.params.id })
            .then(result => res.json({ status: 'success' }))
            .catch(err => {
                res.json({ status: false, message: err.sqlMessage })
            })
})
module.exports = router
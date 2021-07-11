const express = require('express')
const router = express.Router()
const axios = require('axios').default;
const CryptoJS = require('crypto-js');
const moment = require('moment');
const app = express()

// APP INFO
const config = {
    app_id: "2553",
    key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
    key2: "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
    endpoint: "https://sb-openapi.zalopay.vn/v2/create"
};

const embed_data = {};

const items = [{}];
const transID = Math.floor(Math.random() * 1000000);




router.post('/', async (req, res) => {
    const order = {
        app_id: config.app_id,
        app_trans_id: `${moment().format('YYMMDD')}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
        app_user: "SunDepartment",
        app_time: Date.now(), // miliseconds
        item: JSON.stringify(items),
        embed_data: JSON.stringify(embed_data),
        amount: req.body.amount,
        description: `Lazada - Payment for the order #${transID}`,
        bank_code: "zalopayapp",
    };
    // appid|app_trans_id|appuser|amount|apptime|embeddata|item
    const data = config.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
    order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();


    axios.post(config.endpoint, null, { params: order })
        .then(results => {
            let data = results.data
            if (data.return_code === 1) {
                res.json({ status: true, order_url: data.order_url })
            }
            else if (data.return_code === 2) {
                res.json({ status: false, message: data.return_message })
            }
        })
        .catch(err => console.log(err));
})

module.exports = router
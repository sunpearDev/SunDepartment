const express = require('express')
const cors = require("cors")
const connect = require('./connection.js')
const path = require('path');


const app = express();
const port = process.env.PORT || 5000;

require('dotenv').config()
app.use(cors());
app.use(express.json());

connect.connect((err) => {
  if (err) console.log(err)
  else console.log("Database connect successfully.")
})

const Account = require('./routers/account')
const Customer = require('./routers/customer')
const AccountCategory = require('./routers/account_category');
const RoomCategory = require('./routers/room_category');
const Room = require('./routers/room');
const Order = require('./routers/order')
const OrderDetail = require('./routers/order_detail')
const Service = require('./routers/service')
const ServiceDetail = require('./routers/service_detail')
const SupplyCategory = require('./routers/supply_category')
const RoomSupply = require('./routers/room_supply')
const DepartmentSupply = require('./routers/department_supply')
const Payment = require('./routers/payment')
app.use('/account', Account)
app.use('/customer', Customer)
app.use('/account_category', AccountCategory)
app.use('/room_category', RoomCategory)
app.use('/room', Room)
app.use('/order', Order)
app.use('/order_detail', OrderDetail)
app.use('/service', Service)
app.use('/service_detail', ServiceDetail)
app.use('/supply_category', SupplyCategory)
app.use('/room_supply', RoomSupply)
app.use('/department_supply', DepartmentSupply)
app.use('/payment', Payment)

if (process.env.NODE_ENV == 'production') {
  //set static frontend
  app.use(express.static(path.join(__dirname, "client", "build")))
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  });
}


app.listen(port, () => {
  console.log("Server is running on port: " + port);
});

const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const { MongoClient } = require('mongodb')

const admin = require("./admin.js");
const employee = require("./employee.js");
dotenv.config()
const port = process.env.port

const app = express()
app.use(cors())
app.use('/admin', admin);   
app.use('/employee', employee);
app.use(express.json())


app.get('/',(req,res)=>{
    res.send('hello')
})


app.listen(port)




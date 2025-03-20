const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const { MongoClient } = require('mongodb')

const admin = require("./admin.js");
const employee = require("./employee.js");
dotenv.config()

const app = express()
app.use('/admin', admin);   
app.use('/employee', employee);
app.use(cors())
app.use(express.json())
const uri = process.env.uri
const port = process.env.port
const client = new MongoClient(uri)

app.get('/',(req,res)=>{
    res.send('hello')
})

app.listen(port)




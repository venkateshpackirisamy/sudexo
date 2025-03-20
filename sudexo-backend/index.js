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
console.log(uri)
const port = process.env.port
const client = new MongoClient(uri)


//jwt
function generateAccessToken(userName) {
    return jwt.sign({ 'userName': userName }, process.env.SECRET_key, { expiresIn: "1h" });
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)
    jwt.verify(token, process.env.SECRET_key, (err, user) => {

        if (err) return res.status(403).json({ 'error': 'invalid token' })

        req.user = user

        next()
    })
}



app.get('/',(req,res)=>{
    res.send('hello')
})

app.listen(port)



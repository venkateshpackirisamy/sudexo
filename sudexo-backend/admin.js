const express = require('express');
const router = express.Router();
const dotenv = require('dotenv')
const { MongoClient } = require('mongodb')
dotenv.config()
const { hashPassword, verifyPassword } = require('./encrypt_decrypt')
const { generateAccessToken, authenticateToken } = require('./tokens')
router.use(express.json())
const uri = process.env.uri
const dbName = process.env.db
const client = new MongoClient(uri)

router.get('/', (req, res) => {
    res.send('admin')
})

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body
        const errors = []
        if (name && email && password) {
            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

                const hashedPassword = await hashPassword(password)
                const newAdmin = {
                    id: `ad${Date.now()}`,
                    name: name,
                    email: email,
                    password: hashedPassword
                }

                await client.connect()
                const Db = client.db(dbName)
                const collection = Db.collection('AdminUsers')
                if (!await collection.findOne({ email: email })) {
                    const result = await collection.insertOne(newAdmin)
                    if (result.acknowledged === true) {
                        res.status(201).json({
                            "status": "success",
                            "message": "Account created successfully",
                            "status_code": 201
                        })
                        return
                    }
                    else {
                        res.status(500).json(
                            {
                                "status": "error",
                                "message": "INTERNAL SERVER ERROR	",
                                "description": "Unexpected internal server error",
                                "status_code": 500
                            }
                        )
                    }
                    return
                }
                else {
                    res.status(409).json({
                        "status": "error",
                        "message": "Email already in use",
                        "description": "The request could not be completed due to a conflict with the current state of the resource",
                        "errors": [
                            {
                                "field": "email",
                                "error": "This email is already registered. Please use a different one."
                            }
                        ],
                        "status_code": 409
                    })
                    return
                }
            }
            else
                errors.push({
                    "field": "email",
                    "error": "Ivalid email address"
                })
        }
        else {
            if (!name)
                errors.push({
                    "field": "name",
                    "error": "This field is required"
                })
            if (!password)
                errors.push({
                    "field": "password",
                    "error": "This field is required"
                })
            if (!email)
                errors.push({
                    "field": "email",
                    "error": "This field is required"
                })
        }

        if (errors.length >= 1) {
            res.status(400).json(
                {
                    "status": "error",
                    "message": "Invalid input",
                    "description": "Invalid syntax for this request was provided",
                    "errors": errors,
                    "status_code": 400
                }
            )
        }
    } catch (error) {
        console.log(error)
    }
    finally {
        client.close()
    }

})

router.post('/login', async (req, res) => {
    try {
        const errors = []
        const { email, password } = req.body
        if (email, password) {
            await client.connect()
            const Db = client.db(dbName)
            const collection = Db.collection('AdminUsers')
            const login = await collection.findOne({ email: email })
            if (login) {
                if (await verifyPassword(password, login.password)) {
                    const token = generateAccessToken(login.id)
                    res.status(200).json({
                        "status": "success",
                        "message": "Login successful",
                        "description": "Login successful. Welcome back!",
                        "data": {
                            "token": token
                        },
                        "status_code": 200
                    })
                    return
                }
                else {
                    res.status(401).send({
                        "status": "error",
                        "message": "Invalid password",
                        "description": "You are unauthorized to access the requested resource",
                        "errors": [{
                            "field": "password",
                            "error": 'The password you entered is incorrect. Please try again.'
                        }],
                        "status_code": 401
                    })
                    return
                }
            }
            else {
                res.status(404).json(
                    {
                        "status": "error",
                        "message": "Email not found",
                        "description": "We could not find the resource you requested",
                        "errors": [{
                            "field": "password",
                            "error": 'The email address provided does not exist in our records. Please check the email and try again.'
                        }],
                        "status_code": 404
                    })
                return
            }
        }
        else {
            if (!password)
                errors.push({
                    "field": "password",
                    "error": "This field is required"
                })
            if (!email)
                errors.push({
                    "field": "email",
                    "error": "This field is required"
                })
        }
        if (errors.length >= 1) {
            res.status(400).json(
                {
                    "status": "error",
                    "message": "Invalid input",
                    "description": "Invalid syntax for this request was provided",
                    "errors": errors,
                    "status_code": 400
                }
            )
            return
        }
    } catch (error) {

    }
})



module.exports = router;

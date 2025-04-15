const express = require('express');
const router = express.Router();
const { verifyPassword } = require('./encrypt_decrypt')
const { generateAccessToken, authenticateToken } = require('./tokens');
const { MongoClient } = require('mongodb')
router.use(express.json())
const uri = process.env.uri
const dbName = process.env.db

router.get('/', (req, res) => {
    res.send('employee')
})

router.post('/login', async (req, res) => {
    const client = new MongoClient(uri)
    try {
        const errors = []
        const { password, id } = req.body
        if (password, id) {
            await client.connect()
            const Db = client.db(dbName)
            const collection = Db.collection('EmployeeUsers')
            const login = await collection.findOne({ id: id })
            if (login) {
                if (await verifyPassword(password, login.password)) {
                    const token = generateAccessToken(login.id, login.admin_id)
                    res.status(200).json({
                        "status": "success",
                        "message": "Login successful",
                        "description": "Login successful. Welcome back!",
                        "data": {
                            "token": token,
                            "name": login.name
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
                            "field": "email",
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
            if (!id)
                errors.push({
                    "field": "id",
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
        console.log(error)
        res.send('ok')
    }
    finally {
        await client.close()
    }
})

router.get('/accounts', async (req, res) => {
    const client = new MongoClient(uri)
    try {
        if (req.query.email) {
            const email = req.query.email
            await client.connect()
            const Db = client.db(dbName)
            const collection = Db.collection('EmployeeUsers')
            await collection.find({ email: email }).project({ _id: 0, password: 0, pin: 0 }).toArray()
            const account = await collection.aggregate([
                {
                    $match: { email: email }
                },

                {
                    $lookup: {
                        from: "AdminUsers",
                        localField: "admin_id",
                        foreignField: "id",
                        pipeline: [
                            {
                                $project: {
                                    _id: 0,
                                    name: 1
                                }
                            },
                        ],
                        as: "admin"
                    }
                },
                {
                    $unwind: "$admin"
                },
                {
                    $project: { _id: 0, password: 0, pin: 0 }
                }
            ]).toArray()
            if (account) {

                res.status(200).json({
                    "status": "success",
                    "message": "Accounts fetched",
                    "description": "Accounts fetched successful.",
                    "result": account,
                    "status_code": 200
                })
                return

            }
            else {
                res.status(404).json(
                    {
                        "status": "error",
                        "message": "Email not found",
                        "description": "We could not find the resource you requested",
                        "errors": [{
                            "field": "email",
                            "error": 'The email address provided does not exist in our records. Please check the email and try again.'
                        }],
                        "status_code": 404
                    })
                return
            }

        }
        else {
            res.status(400).json(
                {
                    "status": "error",
                    "message": "Invalid input",
                    "description": "Invalid syntax for this request was provided",
                    "errors": [{
                        "field": "email",
                        "error": "This field is required"
                    }],
                    "status_code": 400
                }
            )
            return

        }
    } catch (error) {
        console.log(error)
    }
    finally {
        await client.close()
    }
})

router.post('/balance', authenticateToken, async (req, res) => {
    const client = new MongoClient(uri)
    try {
        if (req.user) {
            if (req.body.pin) {
                await client.connect()
                const Db = client.db(dbName)
                const collection = Db.collection('EmployeeUsers')
                const employee = (await collection.find({ id: req.user.id }).project({ _id: 0, password: 0, admin_id: 0 }).toArray())[0]
                if (employee) {
                    if (employee.pin == req.body.pin) {
                        delete employee.pin
                        res.status(200).json({
                            "status": "success",
                            "message": "employee details ",
                            "description": "employee details fetched successful.",
                            "data": employee,
                            "status_code": 200
                        })
                        return
                    }
                    else {
                        res.status(401).send({
                            "status": "error",
                            "message": "Invalid pin",
                            "description": "You are unauthorized to access the requested resource",
                            "errors": [{
                                "field": "pin",
                                "error": 'The pin you entered is incorrect. Please try again.'
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
                            "message": "employee not found",
                            "description": "We could not find the resource you requested",
                            "errors": [{
                                "error": 'The employee id provided does not exist in our records. Please check the employee id and try again.'
                            }],
                            "status_code": 404
                        })
                    return
                }
            }
            else {
                res.status(400).json(
                    {
                        "status": "error",
                        "message": "Invalid input",
                        "description": "Invalid syntax for this request was provided",
                        "errors": {
                            "field": "pin",
                            "error": "This field is required"
                        },
                        "status_code": 400
                    }
                )
                return
            }
        }
        else {
            res.status(401).json(
                {
                    "status": "error",
                    "message": "UNAUTHORIZED",
                    "description": "You are unauthorized to access the requested resource. Please log in",
                    "errors": "Invalid Token",
                    "status_code": 401
                }
            )
            return
        }
    } catch (error) {
        console.log(error)
        res.send('error')
    }
    finally {
        client.close()
    }

})

router.post('/pay', authenticateToken, async (req, res) => {
    const client = new MongoClient(uri)
    try {
        if (req.user) {
            const { pin, amount, to_id } = req.body
            const errors = []
            if (pin && amount && to_id) {
                if (Number(pin) && Number(amount)) {
                    await client.connect()
                    const Db = client.db(dbName)
                    const collection = Db.collection('EmployeeUsers')
                    const result = await collection.findOneAndUpdate({ id: req.user.id }, [{
                        $set: {
                            balance: {
                                $cond: {
                                    if: { $and: [{ $eq: ["$pin", pin] }, { $gt: ["$balance", Number(amount)] }] },
                                    then: { $subtract: ["$balance", Number(amount)] },
                                    else: "$balance"
                                }
                            }
                        }
                    }
                    ]
                    )

                    if (result) {

                        if (result.pin == pin && result.balance > amount) {
                            const transaction = {
                                id: `T${Date.now()}`,
                                from_id: req.user.id,
                                admin_id: req.user.admin_id,
                                to_id: to_id,
                                type: 'DR',
                                amount: Number(amount),
                                date_time: new Date()
                            }
                            const result2 = await Db.collection('Transaction').insertOne(transaction)
                            if (result2.acknowledged === true) {
                                res.status(200).json({
                                    "status": "success",
                                    "message": "payment Success",
                                    "amount": ` ₹${amount}`,
                                    "description": `send to ${to_id}`,
                                    "status_code": 200
                                })
                                return
                            }
                        }
                        else if (result.pin != pin) {
                            res.status(401).send({
                                "status": "error",
                                "message": "Wrong pin",
                                "description": "You are unauthorized to access the requested resource",
                                "errors": [{
                                    "field": "pin",
                                    "error": 'The pin you entered is incorrect. Please try again.'
                                }],
                                "status_code": 401
                            })
                            return
                        }
                        else if (result.balance < amount) {
                            res.status(400).send({
                                "status": "error",
                                "message": "Insufficient balance",
                                "errors": [{
                                    "field": "pin",
                                    "error": "your balance is insufficient for this  transaction"
                                }],
                                "status_code": 400
                            })
                            return
                        }
                    }
                    else {
                        res.status(404).json(
                            {
                                "status": "error",
                                "message": "employee not found",
                                "description": "We could not find the resource you requested",
                                "errors": [{
                                    "error": 'The employee id provided does not exist in our records. Please check the employee id and try again.'
                                }],
                                "status_code": 404
                            })
                        return
                    }



                }
                else {
                    if (!Number(pin))
                        errors.push({
                            "field": "pin",
                            "error": "Pin Must be Number"
                        })
                    if (!Number(amount))
                        errors.push({
                            "field": "amount",
                            "error": "Amount Must be Number"
                        })
                }
            }
            else {
                if (!pin)
                    errors.push({
                        "field": "pin",
                        "error": "This field is required"
                    })
                if (!amount)
                    errors.push({
                        "field": "amount",
                        "error": "This field is required"
                    })
                if (!to_id)
                    errors.push({
                        "field": "to_id",
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
        }
        else {
            res.status(401).json(
                {
                    "status": "error",
                    "message": "UNAUTHORIZED",
                    "description": "You are unauthorized to access the requested resource. Please log in",
                    "errors": "Invalid Token",
                    "status_code": 401
                }
            )
            return
        }
    } catch (error) {
        console.log(error)
    }
    finally {
        client.close()
    }
})

router.get('/transactions', authenticateToken, async (req, res) => {
    const client = new MongoClient(uri)
    try {
        if (req.user) {
            const page_no = (parseInt(req.query.page_no) && req.query.page_no > 0) ? parseInt(req.query.page_no) : 1
            const month = (parseInt(req.query.month) && req.query.month > 0) ? parseInt(req.query.month) : 0
            const month_filter = {}
            if (month != 0) {
                month_filter.month = month
            }
            const pages = 8
            client.connect()
            const Db = client.db(dbName)
            const collection = Db.collection('Transaction')
            const result = await collection.aggregate([
                {
                    $addFields: {
                        month: { "$month": "$date_time" }
                    }
                },
                {
                    $match: {
                        $and: [
                            { $or: [{ from_id: req.user.id }, { to_id: req.user.id }] },
                            month_filter
                        ]
                    }
                },
                {
                    $sort: { date_time: -1 }
                },
                {
                    $facet: {
                        count: [{ $count: 'totalcount' }],
                        data: [{ $skip: (pages * (page_no - 1)) }, { $limit: pages }],
                    }
                }

            ]).toArray()
            let total_page
            if (result[0].count[0]?.totalcount)
                total_page = Math.ceil(result[0].count[0]?.totalcount / pages)
            else
                total_page = 0

            if (result) {
                res.status(200).json({
                    "status": "success",
                    "message": "transactions",
                    "description": "Transactions fetched successful.",

                    "result": {
                        "total_page": total_page,
                        "current_page": page_no,
                        "data": result[0].data
                    },
                    "status_code": 200
                })
                return
            }
        }
        else {
            res.status(401).json(
                {
                    "status": "error",
                    "message": "UNAUTHORIZED",
                    "description": "You are unauthorized to access the requested resource. Please log in",
                    "errors": "Invalid Token",
                    "status_code": 401
                }
            )
            return
        }
    } catch (error) {
        console.log(error)
    }
    finally {
        client.close()
    }
})

router.get('/transactionsSummary', authenticateToken, async (req, res) => {
    const client = new MongoClient(uri)
    try {
        if (req.user) {
            const today =  new Date()
            const month = today.getMonth()+1
            client.connect()
            const Db = client.db(dbName)
            const collection = Db.collection('Transaction')
            const result = await collection.aggregate([
                {
                    $addFields: {
                        month: { "$month": "$date_time" }
                    }
                },
                {
                    $match: {
                        $and:[
                       {$or: [{ from_id: req.user.id }, { to_id: req.user.id }],},
                       {month:month}
                        ]


                    }
                },

                {

                    $group: {
                        _id: "$type",
                        total: { $sum: "$amount" }
                    }

                }
            ]).toArray()


            if (result) {
                res.status(200).json({
                    "status": "success",
                    "message": "transactions",
                    "description": "Transactions fetched successful.",
                    "result": result,
                    "status_code": 200
                })
                return
            }
        }
        else {
            res.status(401).json(
                {
                    "status": "error",
                    "message": "UNAUTHORIZED",
                    "description": "You are unauthorized to access the requested resource. Please log in",
                    "errors": "Invalid Token",
                    "status_code": 401
                }
            )
            return
        }
    } catch (error) {
        console.log(error)
    }
    finally {
        client.close()
    }
})




module.exports = router;
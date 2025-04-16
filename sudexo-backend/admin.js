const express = require('express');
const dotenv = require('dotenv')
const { MongoClient } = require('mongodb')
const multer = require('multer')
const fs = require("fs");
const { parse } = require("csv-parse");
dotenv.config()
const { hashPassword, verifyPassword } = require('./encrypt_decrypt')
const { generateAccessToken, authenticateToken } = require('./tokens');
const e = require('cors');
const { error } = require('console');
const { match } = require('assert');
const router = express.Router();
router.use(express.json())
const uri = process.env.uri
const dbName = process.env.db

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
})
const upload = multer({ storage: storage })

router.get('/', (req, res) => {
    res.send('admin')
})

router.post('/register', async (req, res) => {
    const client = new MongoClient(uri)
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
    const client = new MongoClient(uri)
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
    finally {
        client.close()
    }
})

router.post('/createEmployee', authenticateToken, async (req, res) => {
    const client = new MongoClient(uri)
    try {
        if (req.user.id) {
            const { name, email, password, pin, amount } = req.body
            const errors = []
            if (name && email && password && pin) {

                if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    if (parseInt(pin)) {
                        const hashedPassword = await hashPassword(password)
                        const newEmp = {
                            id: `emp${Date.now()}`,
                            admin_id: req.user.id,
                            name: name,
                            email: email,
                            password: hashedPassword,
                            pin: pin,
                            balance: Number(amount) ? Number(amount) : 0,
                            active: true
                        }

                        await client.connect()
                        const Db = client.db(dbName)
                        const collection = Db.collection('EmployeeUsers')
                        const esiEmp = await collection.find({ email: email }).toArray()
                        let active = false
                        let dupicate = false
                        esiEmp.forEach((item) => {
                            if (item.active)
                                active = true
                            if (item.admin_id == req.user.id)
                                dupicate = true
                        })
                        console.log(active, esiEmp)
                        if (!dupicate && !active) {
                            const result = await collection.insertOne(newEmp)
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
                        else if (dupicate) {
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
                        else if (active) {
                            res.status(409).json({
                                "status": "error",
                                "message": "Email already in use",
                                "description": "The request could not be completed due to a conflict with the current state of the resource",
                                "errors": [
                                    {
                                        "field": "email",
                                        "error": "This email is active in another admin . Please use a different one."
                                    }
                                ],
                                "status_code": 409
                            })
                            return
                        }
                    } else {
                        errors.push({
                            "field": "pin",
                            "error": "Pin Must be Number"
                        })
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
                if (!pin)
                    errors.push({
                        "field": "pin",
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

router.post('/CreateBulkEmployee', [upload.single('file'), authenticateToken], async (req, res) => {
    const client = new MongoClient(uri)
    try {
        if (req.file) {
            function getData() {
                const datas = [];
                return new Promise((resolve, rejects) => {
                    fs.createReadStream(`./uploads/${req.file.filename}`)
                        .pipe(
                            parse({
                                delimiter: ",",
                                columns: true,
                                ltrim: true,
                            })
                        )
                        .on("data", function (row) {
                            datas.push(row);
                        })
                        .on("error", function (error) {
                            console.log(error.message);
                            rejects(error.message)
                        })
                        .on("end", function () {
                            resolve(datas)
                        })
                }
                )
            }

            if (req.user) {
                let datas
                let fileError
                try {
                    datas = await getData()
                }
                catch (error) {
                    fileError = error
                }
                await client.connect()
                const Db = client.db(dbName)
                const collection = Db.collection('EmployeeUsers')
                const emails = await collection.find().project({ email: 1, active: 1, admin_id: 1, _id: 0 }).toArray()
                if (!fileError && datas.length >= 1) {
                    const result = []
                    const validEmp = []
                    async function processData() {
                        const promises = datas.map(async (data) => {
                            const temp = await createEmployee(data, emails, req.user.id)
                            if (temp.newEmp) {
                                validEmp.push(temp.newEmp)
                            }
                            result.push({ "email": data.email, "result": temp.result })

                        })
                        await Promise.all(promises);
                        final();
                    }
                    processData()
                    const final = async () => {
                        if (validEmp.length >= 1) {
                            const acknowledgement = await collection.insertMany(validEmp)
                            if (!acknowledgement.acknowledged) {
                                res.status(500).json(
                                    {
                                        "status": "error",
                                        "message": "INTERNAL SERVER ERROR	",
                                        "description": "Unexpected internal server error",
                                        "status_code": 500
                                    }
                                )
                                return
                            }
                            res.status(207).json(result)
                            return
                        }
                        else {
                            res.status(207).json(result)
                            return
                        }
                    }

                }
                else {
                    res.status(400).json({
                        "status": "error",
                        "message": "Invalid file",
                        "description": "Invalid syntax for this request was provided",
                        "errors": [
                            {
                                "field": "file",
                                "error": fileError ? fileError : "This field required"
                            }
                        ],
                        "status_code": 400
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
        }
        else {
            res.status(400).json({
                "status": "error",
                "message": "Invalid fie",
                "description": "Invalid syntax for this request was provided",
                "errors": [
                    {
                        "field": "file",
                        "error": "This field required"
                    }
                ],
                "status_code": 400
            })
            return
        }

    } catch (error) {
        console.error(error)
        res.send('error')
    }
    finally {

    }
});

async function createEmployee(data, emails, admin_id) {
    try {
        const { name, email, password, pin, amount } = data
        const errors = []
        if (name && email && password && pin) {
            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                if (parseInt(pin)) {
                    const hashedPassword = await hashPassword(password)
                    const newEmp = {
                        id: `emp${Date.now()}`,
                        admin_id: admin_id,
                        name: name,
                        email: email,
                        password: hashedPassword,
                        pin: pin,
                        balance: Number(amount) ? Number(amount) : 0,
                        active: true
                    }
                    const esiEmp = emails.filter((item) => { return item.email == email })
                    let active = false
                    let dupicate = false
                    esiEmp.forEach((item) => {
                        if (item.active)
                            active = true
                        if (admin_id == item.admin_id)
                            dupicate = true
                    })

                    if (!active && !dupicate) {
                        emails.push({ email: email, active: true })
                        return ({
                            "result": {
                                "status": "success",
                                "message": "Account created successfully",
                                "status_code": 201
                            }, "newEmp": newEmp
                        })
                    }
                    else if (dupicate) {
                        return ({
                            "result": {
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
                            }, newEmp: null
                        })

                    }
                    else if (active) {
                        return ({
                            "result": {
                                "status": "error",
                                "message": "Email already in use",
                                "description": "The request could not be completed due to a conflict with the current state of the resource",
                                "errors": [
                                    {
                                        "field": "email",
                                        "error": "This email is already active in another admin. Please use a different one."
                                    }
                                ],
                                "status_code": 409
                            }, newEmp: null
                        })

                    }
                } else {
                    errors.push({
                        "field": "pin",
                        "error": "Pin Must be Number"
                    })
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
            if (!pin)
                errors.push({
                    "field": "pin",
                    "error": "This field is required"
                })
        }

        if (errors.length >= 1) {
            return ({
                "result": {
                    "status": "error",
                    "message": "Invalid input",
                    "description": "Invalid syntax for this request was provided",
                    "errors": errors,
                    "status_code": 400
                }, newEmp: null
            })
        }


    } catch (error) {
        console.log(error)
    }

}

router.post('/addAmount', authenticateToken, async (req, res) => {
    const client = new MongoClient(uri)
    try {

        if (req.user) {
            const { employee_id, amount } = req.body
            const errors = []
            if (employee_id && amount) {

                if (Number(amount)) {
                    await client.connect()
                    const Db = client.db(dbName)
                    const collection = Db.collection('EmployeeUsers')
                    // const employee = await collection.findOne({ id: employee_id })
                    const employee = await collection.findOneAndUpdate({ id: employee_id }, [{
                        $set: {
                            balance: {
                                $cond: {
                                    if: { $eq: ["$admin_id", req.user.id] },
                                    then: { $add: ["$balance", Number(amount)] },
                                    else: "$balance"
                                }
                            }
                        }
                    }
                    ]
                    )

                    if (employee) {
                        if (req.user.id === employee.admin_id) {

                            const transaction = {
                                id: `T${Date.now()}`,
                                from_id: req.user.id,
                                admin_id: null,
                                to_id: employee_id,
                                type: 'CR',
                                amount: Number(amount),
                                date_time: new Date()
                            }
                            const result = await Db.collection('Transaction').insertOne(transaction)
                            if (result.acknowledged === true) {
                                res.status(200).json({
                                    "status": "success",
                                    "message": "Amount Added ",
                                    "description": "Amounnt added successful.",
                                    "status_code": 200
                                })
                                return
                            }
                            else {
                                res.status(500).json(
                                    {
                                        "status": "error",
                                        "message": "INTERNAL SERVER ERROR",
                                        "description": "Unexpected internal server error",
                                        "status_code": 500
                                    }
                                )
                            }
                            return
                        }
                        else {
                            res.status(401).send({
                                "status": "error",
                                "message": "invalid admin",
                                "description": "You are unauthorized to access the requested resource",
                                "errors": [{
                                    "error": 'you are not the admin of this Account'
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
                    errors.push({
                        "field": "amount",
                        "error": "Amount Must be Number"
                    })
                }
            }
            else {
                if (!employee_id)
                    errors.push({
                        "field": "employee_id",
                        "error": "This field is required"
                    })
                if (!amount)
                    errors.push({
                        "field": "amount",
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
        res.send('error')
    }
    finally {
        client.close()
    }
})

router.get('/employee', authenticateToken, async (req, res) => {
    const client = new MongoClient(uri)
    try {
        if (req.user) {
            const employee_id = req.query.employee_id
            if (employee_id) {
                await client.connect()
                const Db = client.db(dbName)
                const collection = Db.collection('EmployeeUsers')
                const employees = await collection.find({ id: employee_id }).project({ _id: 0, password: 0, pin: 0 }).toArray()
                await client.close()
                const employee = employees[0]
                if (employee) {
                    if (employee.admin_id === req.user.id) {
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
                            "message": "invalid admin",
                            "description": "You are unauthorized to access the requested resource",
                            "errors": [{
                                "error": 'you are not the admin of this Account'
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
                        "errors": [{
                            "field": "employee_id",
                            "error": "This field is required"
                        }],
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
        console.log('admin employee')
        console.log(error)
    }
    finally {
        // client.close()
    }

})

router.get('/employeeByMail', authenticateToken, async (req, res) => {
    const client = new MongoClient(uri)
    try {
        if (req.user) {
            const email_id = req.query.email
            if (email_id) {
                await client.connect()
                const Db = client.db(dbName)
                const collection = Db.collection('EmployeeUsers')
                const employees = await collection.find({ email: email_id }).project({ _id: 0, password: 0, pin: 0 }).toArray()
                const employee = employees[0]
                if (employee) {
                    if (employee.admin_id === req.user.id) {
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
                            "message": "invalid admin",
                            "description": "You are unauthorized to access the requested resource",
                            "errors": [{
                                "error": 'you are not the admin of this Account'
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
                        "errors": [{
                            "field": "email id",
                            "error": "This field is required"
                        }],
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

router.get('/transactions', authenticateToken, async (req, res) => {
    const client = new MongoClient(uri)
    try {
        if (req.user) {
            const employee_id = req.query.employee_id
            const page_no = (parseInt(req.query.page_no) && req.query.page_no > 0) ? parseInt(req.query.page_no) : 1
            const month = (parseInt(req.query.month) && req.query.month > 0) ? parseInt(req.query.month) : 0
            const type = req.query.type
            const month_filter = {}
            if (month != 0) {
                month_filter.month = month
            }
            const type_filter = {}
            if(type=='DR'||type=='CR')
                type_filter.type = type

            const pages = 5
            if (employee_id) {
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
                                { $or: [{ from_id: employee_id }, { to_id: employee_id }] },
                                month_filter,
                                type_filter
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
                    total_page = Math.ceil(result[0].count[0].totalcount / pages)
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
                res.status(400).json(
                    {
                        "status": "error",
                        "message": "Invalid input",
                        "description": "Invalid syntax for this request was provided",
                        "errors": [{
                            "field": "employee_id",
                            "error": "This field is required"
                        }],
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
        console.log('admin transaction')
        console.log(error)
    }
    finally {
        await client.close()
    }
})

router.get('/employees', authenticateToken, async (req, res) => {
    const client = new MongoClient(uri)
    try {
        if (req.user) {
            const page_no = (parseInt(req.query.page_no) && req.query.page_no > 0) ? parseInt(req.query.page_no) : 1
            const level = (parseInt(req.query.level) && req.query.level > 0) ? parseInt(req.query.level) : 0
            const nameReg = req.query.name
            const nameFilter = {}
            if (nameReg) {
                nameFilter.$or = []
                nameFilter.$or.push({ name: RegExp(nameReg.toUpperCase()) })
                nameFilter.$or.push({ name: RegExp(nameReg.toUpperCase()) })
                nameFilter.$or.push({ name: RegExp(nameReg.toLowerCase()) })
                nameFilter.$or.push({ name: RegExp(nameReg[0].toUpperCase() + nameReg.slice(1).toLowerCase()) })
            }
            let filter = {}
            if (level == 1)
                filter = { balance: { $gte: 2000 } }
            else if (level == 2)
                filter = { $and: [{ balance: { $lt: 2000 } }, { balance: { $gte: 1000 } }] }
            else if (level == 3)
                filter = { balance: { $lt: 1000 } }

            const pages = 7
            await client.connect()
            const Db = client.db(dbName)
            const collection = Db.collection('EmployeeUsers')
            const result = await collection.aggregate([
                {
                    $match: {
                        $and: [{ admin_id: req.user.id }, filter, nameFilter]
                    }
                },
                {
                    $project: { _id: 0, pin: 0, password: 0 }
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
                total_page = Math.ceil(result[0].count[0].totalcount / pages)
            else
                total_page = 0

            if (result) {
                res.status(200).json({
                    "status": "success",
                    "message": "Employees fetched",
                    "description": "Employees fetched successful.",

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
        await client.close()
    }

})

router.get('/dashBoard', authenticateToken, async (req, res) => {
    const client = new MongoClient(uri)
    try {
        if (req.user) {
            await client.connect()
            const Db = client.db(dbName)
            const collection = Db.collection('EmployeeUsers')
            const result = await collection.aggregate([
                {
                    $match: {
                        admin_id: req.user.id
                    }
                },
                {
                    $facet: {
                        total: [{ $count: 'total' }],
                        LessT1000: [
                            { $match: { balance: { $lt: 1000 } } },
                            { $count: "LessT1000" }
                        ],
                        LessT2000: [
                            { $match: { $and: [{ balance: { $lt: 2000 } }, { balance: { $gte: 1000 } }] } },
                            { $count: "LessT2000" }
                        ],
                        GreatT2000: [
                            { $match: { balance: { $gte: 2000 } } },
                            { $count: "GreatT2000" }
                        ],

                    }
                }

            ]).toArray()

            if (result) {
                res.status(200).json({
                    "status": "success",
                    "message": "Employees fetched",
                    "description": "Employees fetched successful.",

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
        res.send('error')
    }
    finally {
        client.close()
    }

})

router.get('/monthlyspending', authenticateToken, async (req, res) => {
    const client = new MongoClient(uri)
    try {
        if (req.user) {
            await client.connect()
            const Db = client.db(dbName)
            const collection = Db.collection('Transaction')
            const sixMonthsAgo = new Date()
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
            const result = await collection.aggregate([
                {
                    $match: {
                        admin_id: req.user.id,
                        date_time: { $gte: sixMonthsAgo }
                    }
                },
                {
                    $project: {
                        month: { $month: "$date_time" },
                        amount: 1
                    }
                },
                {
                    $group: {
                        _id: "$month",
                        totalAmount: { $sum: "$amount" }
                    }
                },
                {
                    $sort: { _id: 1 }
                }
            ]).toArray()
            if (result) {
                res.status(200).json({
                    "status": "success",
                    "message": "spending fetched",
                    "description": "spending data fetched successful.",
                    "result": result,
                    "status_code": 200
                })
                return
            }
        } else {
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
        await client.close()
    }

})

router.get('/employeeSpending', authenticateToken, async (req, res) => {
    const client = new MongoClient(uri)
    try {
        if (req.user) {

            const today = new Date()
            const page_no = (parseInt(req.query.page_no) && req.query.page_no > 0) ? parseInt(req.query.page_no) : 1
            const month = (parseInt(req.query.month) && req.query.month > 0) ? parseInt(req.query.month) : (today.getMonth() + 1)
            const pages = 7
            await client.connect()
            const Db = client.db(dbName)
            const collection = Db.collection('EmployeeUsers')
            const result = await collection.aggregate([
                {
                    $match: {
                        admin_id: req.user.id
                    }
                },
                {
                    $lookup: {
                        from: "Transaction",
                        localField: "id",
                        foreignField: "from_id",
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $eq: [{ $month: "$date_time" }, month
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: "$from_id",
                                totalspending: { $sum: "$amount" }
                            }
                        },

                        ],

                        as: "transaction"
                    }
                },
                {
                    $project: { _id: 0, pin: 0, password: 0, }
                },
                {
                    $sort: { "transaction.totalspending": -1 }
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
                total_page = Math.ceil(result[0].count[0].totalcount / pages)
            else
                total_page = 0

            if (result) {
                res.status(200).json({
                    "status": "success",
                    "message": "Employees fetched",
                    "description": "Employees fetched successful.",

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
        res.send('error')
    }
    finally {
        await client.close()
    }

})

router.post('/deactivateEmployee', authenticateToken, async (req, res) => {
    const client = new MongoClient(uri)
    try {

        if (req.user) {
            const { employee_id } = req.body
            if (employee_id) {
                await client.connect()
                const Db = client.db(dbName)
                const collection = Db.collection('EmployeeUsers')
                // const employee = await collection.findOne({id: employee_id })
                const employee = await collection.findOneAndUpdate({ id: employee_id }, [{
                    $set: {
                        active: {
                            $cond: {
                                if: { $eq: ["$admin_id", req.user.id] },
                                then: false,
                                else: "$active"
                            }
                        }
                    }
                }
                ]
                )
                if (employee) {
                    if (req.user.id === employee.admin_id) {
                        res.status(200).json({
                            "status": "success",
                            "message": "Status Changed ",
                            "description": "Status Changed successful.",
                            "status_code": 200
                        })
                        return
                    }
                    else {
                        res.status(401).send({
                            "status": "error",
                            "message": "invalid admin",
                            "description": "You are unauthorized to access the requested resource",
                            "errors": [{
                                "error": 'you are not the admin of this Account'
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
                        "errors": [{
                            "field": "employee_id",
                            "error": "This field is required"
                        }],
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
        await client.close()
    }
})

router.post('/activateEmployee', authenticateToken, async (req, res) => {
    const client = new MongoClient(uri)
    try {

        if (req.user) {
            const { employee_id } = req.body
            if (employee_id) {
                await client.connect()
                const Db = client.db(dbName)
                const collection = Db.collection('EmployeeUsers')
                const employee = await collection.findOneAndUpdate({ id: employee_id }, [{
                    $set: {
                        active: {
                            $cond: {
                                if: { $eq: ["$admin_id", req.user.id] },
                                then: true,
                                else: "$active"
                            }
                        }
                    }
                }
                ]
                )
                if (employee) {
                    if (req.user.id === employee.admin_id) {
                        res.status(200).json({
                            "status": "success",
                            "message": "Status Changed ",
                            "description": "Status Changed successful.",
                            "status_code": 200
                        })
                        return
                    }
                    else {
                        res.status(401).send({
                            "status": "error",
                            "message": "invalid admin",
                            "description": "You are unauthorized to access the requested resource",
                            "errors": [{
                                "error": 'you are not the admin of this Account'
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
                        "errors": [{
                            "field": "employee_id",
                            "error": "This field is required"
                        }],
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
        await client.close()
    }
})

router.post('/resetPassword', authenticateToken, async (req, res) => {
    const client = new MongoClient(uri)
    try {
        if (req.user) {
            const { employee_id, password } = req.body
            if (employee_id && password) {
                const hPassword = await hashPassword(password)
                await client.connect()
                const Db = client.db(dbName)
                const collection = Db.collection('EmployeeUsers')
                const employee = await collection.findOneAndUpdate({ id: employee_id }, [{
                    $set: {
                        password: {
                            $cond: {
                                if: { $eq: ["$admin_id", req.user.id] },
                                then: { $literal: hPassword },
                                else: "$password" 
                            }
                        }
                    }
                }
                ], { returnDocument: 'after' }
                )
                if (employee) {
                    if (req.user.id === employee.admin_id) {
                        res.status(200).json({
                            "status": "success",
                            "message": "Password Changed ",
                            "description": "Password Changed successful.",
                            "status_code": 200
                        })
                        return
                    }
                    else {
                        res.status(401).send({
                            "status": "error",
                            "message": "invalid admin",
                            "description": "You are unauthorized to access the requested resource",
                            "errors": [{
                                "error": 'you are not the admin of this Account'
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
                if (!employee_id) {
                    res.status(400).json(
                        {
                            "status": "error",
                            "message": "Invalid input",
                            "description": "Invalid syntax for this request was provided",
                            "errors": [{
                                "field": "employee_id",
                                "error": "This field is required"
                            }],
                            "status_code": 400
                        }
                    )
                    return
                }
                else if (!password) {
                    res.status(400).json(
                        {
                            "status": "error",
                            "message": "Invalid input",
                            "description": "Invalid syntax for this request was provided",
                            "errors": [{
                                "field": "password",
                                "error": "This field is required"
                            }],
                            "status_code": 400
                        }
                    )
                    return
                }

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
        await client.close()
    }
})

router.post('/resetPin', authenticateToken, async (req, res) => {
    const client = new MongoClient(uri)
    try {

        if (req.user) {
            const { employee_id, pin } = req.body
            if (employee_id && parseInt(pin)) {
                await client.connect()
                const Db = client.db(dbName)
                const collection = Db.collection('EmployeeUsers')
                const employee = await collection.findOneAndUpdate({ id: employee_id }, [{
                    $set: {
                        pin: {
                            $cond: {
                                if: { $eq: ["$admin_id", req.user.id] },
                                then: pin,
                                else: "$pin"
                            }
                        }
                    }
                }
                ]
                )
                if (employee) {
                    if (req.user.id === employee.admin_id) {
                        res.status(200).json({
                            "status": "success",
                            "message": "Pin Changed ",
                            "description": "Pin Changed successful.",
                            "status_code": 200
                        })
                        return
                    }
                    else {
                        res.status(401).send({
                            "status": "error",
                            "message": "invalid admin",
                            "description": "You are unauthorized to access the requested resource",
                            "errors": [{
                                "error": 'you are not the admin of this Account'
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
                if (!employee_id) {
                    res.status(400).json(
                        {
                            "status": "error",
                            "message": "Invalid input",
                            "description": "Invalid syntax for this request was provided",
                            "errors": [{
                                "field": "employee_id",
                                "error": "This field is required"
                            }],
                            "status_code": 400
                        }
                    )
                    return
                }
                else if (!pin) {
                    res.status(400).json(
                        {
                            "status": "error",
                            "message": "Invalid input",
                            "description": "Invalid syntax for this request was provided",
                            "errors": [{
                                "field": "pin",
                                "error": "This field is required"
                            }],
                            "status_code": 400
                        }
                    )
                    return
                }
                else if (!parseInt(pin)) {
                    res.status(400).json(
                        {
                            "status": "error",
                            "message": "Invalid input",
                            "description": "Invalid syntax for this request was provided",
                            "errors": [{
                                "field": "pin",
                                "error": "Pin must be Number"
                            }],
                            "status_code": 400
                        }
                    )
                    return
                }


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
        await client.close()
    }
})


module.exports = router;

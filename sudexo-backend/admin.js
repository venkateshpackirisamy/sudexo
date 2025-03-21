const express = require('express');
const dotenv = require('dotenv')
const { MongoClient } = require('mongodb')
const multer = require('multer')
const fs = require("fs");
const { parse } = require("csv-parse");
dotenv.config()
const { hashPassword, verifyPassword } = require('./encrypt_decrypt')
const { generateAccessToken, authenticateToken } = require('./tokens');
const { error } = require('console');
const router = express.Router();
router.use(express.json())
const uri = process.env.uri
const dbName = process.env.db
const client = new MongoClient(uri)


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

router.post('/createEmployee', authenticateToken, async (req, res) => {
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
                            balance: Number(amount) ? amount : 0
                        }

                        await client.connect()
                        const Db = client.db(dbName)
                        const collection = Db.collection('EmployeeUsers')
                        if (!await collection.findOne({ email: email })) {
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
        }
    } catch (error) {
        console.log(error)
    }
    finally {
        client.close()
    }

})

router.post('/CreateBulkEmployee', [upload.single('file'), authenticateToken], async (req, res) => {
    try {
        if (req.file) {
            console.log(req.file,"This My File ")
            const datas = [];
            let fileError = null
            await fs.createReadStream(`./uploads/${req.file.filename}`)
                .pipe(
                    parse({
                        delimiter: ",",
                        columns: true,
                        ltrim: true,
                    })
                )
                .on("data", async function (row) {
                   await datas.push(row);
                })
                .on("error", function (error) {
                    console.log(error.message);
                    fileError = error.message
                })
                .on("end", function () {
                    console.log("File parsing complete. Parsed rows:", datas.length); // Debugging line
                });

        
            if (req.user) {
             
                await client.connect()
                console.log(datas.length,"this My datas starting")
                console.log(datas,"this My datas starting")
                const Db = client.db(dbName)
                const collection = Db.collection('EmployeeUsers')
                const emails = (await collection.find().project({ email: 1, _id: 0 }).toArray()).map(item => { return item.email })
                if (datas.length >= 1 && !fileError) {
                    const result = []
                    const validEmp = []
                    let inc = 0
                    async function processData() {
                        console.log("Email Lenth Beofre calling CreateEmp",emails.length)
                        console.log(datas.length,"This datas ")
                        const promises = datas.map(async (data) => {
                            inc = inc +1
                            console.log(inc,"I AM Inc")
                            const temp = await createEmployee(data, emails, req.user.id)
                            console.log(temp,"temp Result")
                            if (temp.newEmp) {
                                console.log("New Temp")
                                validEmp.push(temp.newEmp)}
                           
                            result.push({ "email": data.email, "result": temp.result })
                            
                        })

                        await Promise.all(promises);
                        final();
                        disp()
                    }
                    processData()
                    function disp(){
                        // console.log("resullt",result)
                        // console.log("validemp",validEmp)
                    }
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
                            res.status(407).json(result)
                            return
                        }
                        else {
                            res.status(407).json(result)
                            return
                        }
                    }

                }
                else {
                    res.status(400).send({
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
            res.status(400).send({
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
        res.send('error')
        console.error(error)
    }
    finally {

    }
});

async function createEmployee(data, emails, admin_id) {
    try {
        const { name, email, password, pin, amount } = data
        const errors = []
        if (name && email && password && pin) {
            console.log(emails)
            console.log(emails.length,"Email Length")
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
                        balance: Number(amount) ? amount : 0
                    }

                    if (!emails.includes(email)) {
                        console.log('bofore',emails)
                        emails.push(email)
                        console.log('after',emails)
                        return ({
                            "result": {
                                "status": "success",
                                "message": "Account created successfully",
                                "status_code": 201
                            }, "newEmp": newEmp
                        })
                    }
                    else {
                        return ({"result":{
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
                        }, newEmp: null})

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
            return ({"result":{
                    "status": "error",
                    "message": "Invalid input",
                    "description": "Invalid syntax for this request was provided",
                    "errors": errors,
                    "status_code": 400
                }, newEmp: null})
        }


    } catch (error) {
        console.log(error)
    }

}






module.exports = router;

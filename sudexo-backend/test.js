const { hashPassword, verifyPassword } = require('./encrypt_decrypt')
const mails =  ['abc@gmail.com','tm@gmail.com','abc@gmail.com']
createEmployee(
    {
        "name":"Tom",
        "password":"tom123",
        "email":"tom@gmail.com",
        "pin":"1234"
      },
     mails
).then(data=>{console.log(data)
    
})

async function createEmployee(data, emails) {
    try {
        const { name, email, password, pin, amount, admin_id } = data
        const errors = []
        if (name && email && password && pin) {

            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                if (parseInt(pin)) {
                    const hashedPassword = await hashPassword(password)
                    const newAdmin = {
                        id: `emp${Date.now()}`,
                        admin_id: admin_id,
                        name: name,
                        email: email,
                        password: hashedPassword,
                        pin: pin,
                        balance: Number(amount) ? amount : 0
                    }

                    if (!emails.includes(newAdmin.email)) {
                        emails.push(newAdmin.email)
                        return ([{
                            "status": "success",
                            "message": "Account created successfully",
                            "status_code": 201
                        },newAdmin])
                    }
                    else {
                        return ({
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
            return (
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
    

}
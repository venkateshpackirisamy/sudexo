const jwt = require('jsonwebtoken')

function generateAccessToken(id, admin_id) {
    if (!admin_id)
        return jwt.sign({ 'id': id }, process.env.SECRET_key, { expiresIn: "7d" });
    else
        return jwt.sign({ 'id': id ,'admin_id':admin_id}, process.env.SECRET_key, { expiresIn: "7d" });
}
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null)
        return res.status(401).json(
            {
                "status": "error",
                "message": "FORBIDDEN",
                "description": "You are unauthorized to access the requested resource. Please log in",
                "errors": "Your account is not authorized to access the requested resource",
                "status_code": 401
            }
        )
    jwt.verify(token, process.env.SECRET_key, (err, user) => {

        if (err)
            return res.status(401).json(
                {
                    "status": "error",
                    "message": "UNAUTHORIZED",
                    "description": "Your account is not authorized to access the requested resource",
                    "errors": "The provided token is invalid or has expired. Please reauthenticate.",
                    "status_code": 401
                })

        req.user = user

        next()
    })
}

module.exports = { generateAccessToken, authenticateToken }
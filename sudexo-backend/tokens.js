const jwt = require('jsonwebtoken')

function generateAccessToken(id) {
    return jwt.sign({ 'id': id }, process.env.SECRET_key, { expiresIn: "3h" });
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

module.exports =  {generateAccessToken,authenticateToken}
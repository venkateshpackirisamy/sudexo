const express = require('express');
const router = express.Router();
const multer = require('multer')
const path = require('path')

//multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
})
const upload = multer({ storage: storage })


router.get('/',(req,res)=>{
    res.send('admin')
})


module.exports = router;

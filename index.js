const express = require('express');
const router = express.Router();


router.get('/',(req,res)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    res.send({
        response:"Ishi socket server is up and running"
    }).status(200)
})


module.exports = router;

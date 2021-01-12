const express = require('express')
const { ensureAuthenticated,forwardAuthenticated } = require('../config/auth');

const otherR = express.Router();



otherR.get('/',ensureAuthenticated,(req,res)=>{
    res.render('otherStuff',{
        title : 'Other',
        nav : false,
        user : req.user,
    })
})

// otherR.get('/')


module.exports = otherR;




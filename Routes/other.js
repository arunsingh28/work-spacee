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


// otherR.get('/image',ensureAuthenticated,(req,res)=>{
//     res.render('image',{
//         title : 'images',
//         nav : false,
//         user : req.user
//     })
// })

otherR.get('/image',ensureAuthenticated,(req,res)=>{
    
    
})


module.exports = otherR;




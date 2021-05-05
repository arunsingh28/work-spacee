const express = require('express')
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const mongoose = require('mongoose');

const Image = require('../Models/image');
const User = require('../Models/register');
const Friend =  require('../Models/friend')


const otherR = express.Router();






otherR.get('/', ensureAuthenticated, (req, res) => {
    res.render('otherStuff', {
        title: 'Other',
        nav: false,
        user: req.user,
    })
})


otherR.get('/fileUpload', ensureAuthenticated, (req, res) => {
    res.redirect('/other')
})

otherR.post('/fileUpload', async (req, res) => {
    const {pic} = req.body
    const allot = req.user._id;
    try {
       const response = await Image.create({pic,allot})
       .then(()=>{
           req.flash('success_msg','image uploaded')
           res.redirect('/other/image')
       })
    } catch (error) {
        throw error
    }
    res.json({status : 'ok'})
});


otherR.get('/image', ensureAuthenticated, (req, res) => {
    const allot = req.user._id
    Image.find({ allot }, (err, img) => {
        res.render('image', {
            img,
            user: req.user,
            nav: false,
            title: 'Image'
        })
    })
})

otherR.get('/image/d/:id', ensureAuthenticated, (req, res) => {
    const { id } = req.params;
    Image.remove({ _id: id })
        .then(() => {
            req.flash('success_msg', '👍 image successfully deleted.')
            return res.redirect('/other/image')
        }).catch(() => {
            req.flash('error', 'Error occour while deling image.')
            return res.redirect('/other/image')
        })
})

otherR.post('/change-profile', (req, res) => {
    const { img } = req.body;
})




otherR.get('/friend/:id',async(req,res)=>{
    const id = req.params.id
    const friend = req.user._id
    const newFriend = await new Friend({user,friend})
    console.log(newFriend)
})






module.exports = otherR;





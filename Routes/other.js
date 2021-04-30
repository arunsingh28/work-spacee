const express = require('express')
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const mongoose = require('mongoose');

const Image = require('../Models/image');
const User = require('../Models/register');

const otherR = express.Router();


const imageMimeTypes = ["image/jpeg", "image/png", "images/gif"];



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

otherR.post('/fileUpload', async (req, res, next) => {
    const { img } = req.body;
    const allot = req.user._id;
    const movie = new Image({ allot });

    saveImage(movie, img);

    try {
        const newMovie = await movie.save();
        req.flash('error_msg','Image is Saved')
        res.redirect('/other/image')
    } catch (err) {
        console.log(err)
    }

});


function saveImage(movie, imgEncoded) {
    if (imgEncoded == null) return;
    const img = JSON.parse(imgEncoded);
    if (img != null && imageMimeTypes.includes(img.type)) {
        movie.img = new Buffer.from(img.data, "base64");
        movie.imgType = img.type;
    }
}

otherR.get('/image', ensureAuthenticated, (req, res) => {
    const allot = req.user._id
    Image.find({ allot },(err,img)=>{
        res.render('image',{
            img,
            user : req.user,
            nav : false,
            title : 'Image'
        })
    })
})

otherR.get('/image/d/:id',ensureAuthenticated,(req,res)=>{
    const { id } = req.params;
    Image.remove({_id : id})
    .then(()=>{
        req.flash('error_msg','Pic is Deleted.')
        res.redirect('/other/image')
    }).catch(err => console.log(err))
})

otherR.post('/change-profile',(req,res)=>{
    const { img } = req.body;
})






module.exports = otherR;





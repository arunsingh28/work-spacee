const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { forwardAuthenticated,ensureAuthenticated } = require('../config/auth');

const app = express.Router();

const userDB = require('../Models/register');


app.get('/', forwardAuthenticated, (req,res)=>{
    res.render('home',{
        title : 'Home',
        nav : true
    })
})

app.get('/login', forwardAuthenticated, (req,res)=>{
    res.render('login',{
        title : 'login',
        nav : true
    })
})

app.get('/dashboard',ensureAuthenticated, (req,res)=>{
   res.render('dashboard',{
       title : 'Dashboard',
       nav: false,
       user : req.user
   })
})

app.post('/register',(req,res)=>{
    const {name,nickName,email,password,tc} = req.body;
    const newUser = new userDB({name,nickName,email,password});
        bcrypt.genSalt(10,(err,salt)=>{
            bcrypt.hash(newUser.password,salt,(err,hash)=>{
                if(err) throw err;
                newUser.password = hash;
                newUser.save()
                .then(()=>{
                    req.flash('message','You Are Registered.')
                    res.redirect('/login')
                })
                .catch(err => console.log(err))
            })
        })
})

app.post('/login',(req,res,next)=>{
    passport.authenticate('local',{
        successRedirect : '/dashboard',
        failureRedirect : '/login',
        failureFlash : true
    })(req, res, next);
});

app.get('/logout',(req,res)=>{
    req.logout();
    req.flash('sucees_msg','You are Logout Out');
    res.redirect('/')
})

module.exports = app;
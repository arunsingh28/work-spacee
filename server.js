const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose')
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

const app = express();

require('./config/passport')(passport)

const db = 'mongodb://127.0.0.1:27017/Tracker'
mongoose.connect(db,{useNewUrlParser:true,useUnifiedTopology: true})
.then(()=> console.log('MongoDB is connected'))
.catch(err => console.log(err))


app.use(expressLayouts);
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(express.urlencoded({extended:true}));

app.use(session({
    secret : 'arunsingh09',
    resave : true,
    saveUninitialized : true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Global variables
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
  });

app.use('/', require('./Routes/website'))


app.use('/*',(req,res)=>{
    res.redirect('/')
})

const PORT = process.env.PORT || 70;
app.listen(PORT,()=>{
    console.log(`Server Runiing On http://localhost:${PORT}`)
})
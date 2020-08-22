const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const socket = require('socket.io');
const http = require('http');

const app = express();



// soket io
const server = http.createServer(app);
const io = socket(server);

require('./config/passport')(passport)

const db = 'mongodb+srv://arun:1234@cluster0-t3qon.mongodb.net/Traker'
// const db = 'mongodb://127.0.0.1:27017/Tracker'
mongoose.connect(db,{useNewUrlParser:true,useUnifiedTopology: true, usecreateIndexes:true})
.then(()=> console.log('MongoDB is connected'))
.catch(err => console.log(err))


app.set('views', path.join(__dirname, 'Views'));
app.use(expressLayouts);
app.set("view engine", "ejs");
app.use(express.static("Public"));

app.use(express.urlencoded({ extended:true }));

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
    res.locals.down_msg = req.flash('down_msg');
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
const express = require('express');
const http = require('http');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const socket = require('socket.io');

const { ensureAuthenticated } = require('./config/auth');


const app = express();
const server = http.createServer(app)
const io = socket(server);



require('./config/passport')(passport)

const db = 'mongodb+srv://arun:1234@cluster0-t3qon.mongodb.net/Traker'


mongoose.Promise = Promise;
mongoose.connect(db,{useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex : true})
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
    saveUninitialized : true,
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

const reminderDB = require('./Models/reminder');
const linkDB = require('./Models/link');


app.get('/dashboard',ensureAuthenticated, (req,res)=>{
    var users = 0;
    io.on('connection',socket =>{
        users++;
        socket.emit('online',req.user.nickName);
        socket.on('disconnect',()=>{
            socket.emit('offline',req.user.nickName)
        })
    })
    const AID = req.user._id;
    reminderDB.find({AID},(err,reminder)=>{
        if(err) throw err;
        linkDB.find({AID},(err,link)=>{
            if(err) throw err;
            res.render('dashboard',{
                title : 'Dashboard',
                nav: false,
                user : req.user,
                reminder : reminder,
                link,
            })
        })
    })
})




app.use('*', (req,res) =>{
    req.flash('message','Welcome back')
    res.redirect('/')
})

const PORT = process.env.PORT || 70;

server.listen(PORT,()=>{
    console.log(`Server Running On http://localhost:${PORT}`)
})



const express = require('express');
const http = require('http');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const socket = require('socket.io');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet')
const _ = require("lodash");

const { ensureAuthenticated } = require('./config/auth');


const app = express();
const server = http.createServer(app)
const io = socket(server);
app.use(morgan('dev'))


app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ limit: '5mb', extended: true }));



require('./config/passport')(passport)

const db = 'mongodb+srv://arun:1234@cluster0-t3qon.mongodb.net/Traker'


mongoose.connect(db,{ useUnifiedTopology: true})
    .then(() => console.log('database is connected'))
    .catch(err => console.log(err))



app.set('views', path.join(__dirname, 'Views'));
app.use(expressLayouts);
app.set("view engine", "ejs");
app.use(express.static("Public"));


app.use(session({
    secret: 'adfTDDaaHAdhj;paaad^%dfrunsi$%#aDFSasda&erdsngh0P)*^_SD9',
    resave: true,
    saveUninitialized: true,
}));


app.use(passport.initialize());
app.use(passport.session());
// app.use(helmet())
app.use(flash());

// Global variables
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error = req.flash('error');
    res.locals.down_msg = req.flash('down_msg');
    next();
});


app.use('/', require('./Routes/website'))

const reminderDB = require('./Models/reminder');
const linkDB = require('./Models/link');
const image = require('./Models/image');





app.get('/dashboard', ensureAuthenticated,(req, res) => {

    let users = {};
    io.on('connection', (socket) => {
        // user
        let onLine = req.user.nickName
        // check if user exits
        if (!users[onLine]) users[onLine] = []

        users[onLine].push(socket.id)

        io.sockets.emit('online', { onLine });

        socket.on('disconnect', () => {
            _.remove(users[onLine], (u) => u === socket.id)
            if (users[onLine].length === 0) {
                io.sockets.emit('offline', onLine)
                delete users[onLine]
            }
            socket.disconnect();
        })
    })

    const id = req.user._id;
     reminderDB.find({ AID : id }, (err, reminder) => {
        if (err) throw err;
         linkDB.find({ AID :id }, (err, link) => {
            if (err) throw err;
            image.find({ allot: id }, (err, pic) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "text/html");
                return res.render('dashboard', {
                    title: 'Dashboard',
                    nav: false,
                    user: req.user,
                    reminder: reminder,
                    link,
                    users
                })
            })
        })
    })
})

// other stuff
app.use('/other', require('./Routes/other'))


// for invalid urls
app.use('/*', (req, res) => {
    var url = req.baseUrl;
    var host = req.hostname;
    var protocol = req.protocol;
    req.flash('error_msg', `${protocol}://${host}${url} is invalid URL.`)
    return res.redirect('/login')
})




const PORT = process.env.PORT || 70;
server.timeout = 0;
server.listen(PORT, () => {
    console.log(server.timeout)
    console.log(`Server Running On http://localhost:${PORT}`)
})



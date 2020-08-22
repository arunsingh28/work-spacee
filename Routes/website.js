const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { forwardAuthenticated,ensureAuthenticated } = require('../config/auth');

const app = express.Router();

const userDB = require('../Models/register');
const noteDB = require('../Models/note');
const reminderDB = require('../Models/reminder');
const linkDB = require('../Models/link');

app.get('/', forwardAuthenticated, (req,res)=>{
    res.render('home',{
        title : 'Home',
        nav : true
    })
})

app.get('/login', (req,res)=>{
    res.render('login',{
        title : 'login',
        nav : true
    })
})

app.get('/dashboard',ensureAuthenticated, (req,res)=>{
    const AID = req.user._id;
    reminderDB.find({AID:AID},(err,reminder)=>{
        linkDB.find({AID:AID},(err,link)=>{
            res.render('dashboard',{
                title : 'Dashboard',
                nav: false,
                user : req.user,
                reminder : reminder,
                link : link
            })
        })
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
    req.flash('sucess_msg','You are Logout Out');
    res.redirect('/');
})

app.get('/share-work', ensureAuthenticated,(req,res)=>{
    noteDB.find({},(err,note)=>{
        res.render('shareWork',{
            title : 'ShareWork',
            nav : false,
            user : req.user,
            note : note
        })
    })
})

app.get('/note', ensureAuthenticated, (req,res)=>{
    const id = req.user._id;
    noteDB.find({AID:id},(err,note)=>{
        if(!note){
            req.flash('error_msg','No Note Present')
            res.redirect('/')
        }
        res.render('note',{
            title : 'Notes',
            nav : false,
            user : req.user,
            note : note
            })
    }).sort({title : -1})
})

app.get('/what-is-next', ensureAuthenticated, (req,res)=>{
    res.render('next',{
        title : 'Next',
        nav : false,
        user : req.user
    })
})

app.get('/q&a', ensureAuthenticated, (req,res)=>{
    res.render('q&n',{
        title : 'question',
        nav : false,
        user : req.user
    })
})

// get request
app.get('/all-reminder',ensureAuthenticated, (req,res)=>{
    const AID = req.user._id;
    reminderDB.find({AID:AID},(err,reminder)=>{
        res.render('reminder',{
            title : 'Reminder',
            nav : false,
            user : req.user,
            reminder : reminder
        })
    })
})
// post request
app.post('/reminder',ensureAuthenticated,(req,res)=>{
      // time funciton
   var time = new Date();
   var d = time.getDate(); // get Today Date
   var h = time.getHours()+6; // get Hours
   var m = time.getMinutes()-30; // get Minite
   var month = time.getMonth()+1;
   var year = time.getFullYear();
   var fullTime;
   if(h < 12){
     fullTime = d+"-"+month+"-"+year+" Time "+h+":"+m+" "+"AM";
   }else{
    h-=12;
     fullTime = d+"-"+month+"-"+year+" Time "+h+":"+m+" "+"PM";
   }
    const {reminder} = req.body;
    const AID = req.user._id;
    const date = fullTime;
    const newReminder = reminderDB({reminder,AID,date})
    newReminder.save()
    .then(()=>{req.flash('down_msg','Your reminder set Successfuly');res.redirect('/')})
    .catch((err)=> console.log(err));
})



// settings
app.get('/account-settings',ensureAuthenticated,(req,res)=>{
    res.render('setting',{
        title : 'Setting',
        user: req.user,
        nav : false
    })
})




// saving notes
app.post('/save-note',ensureAuthenticated,(req,res)=>{
   // time funciton
   var time = new Date();
   var d = time.getDate(); // get Today Date
   var h = time.getHours()+6; // get Hours
   var m = time.getMinutes()-30; // get Minite
   var month = time.getMonth()+1;
   var year = time.getFullYear();
   var fullTime;
   if(h < 12){
     fullTime = d+"-"+month+"-"+year+" Time "+h+":"+m+" "+"AM";
   }else{
       h-=12;
     fullTime = d+"-"+month+"-"+year+" Time "+h+":"+m+" "+"PM";
   }

    const {note,public} = req.body;
    if(public == undefined){
        // private
       const writer = req.user.name;
       const date = fullTime;
       const public = 'Private';
       const AID = req.user._id
       const newNote = noteDB({note,public,writer,date,AID});
       newNote.save()
       .then(()=>{
        req.flash('down_msg','Note Save to Private Note.');
        res.redirect('/');
       })
       .catch((err)=> {
        req.flash('error_msg','Error While Saveing Note Save Again');
        res.redirect('/');
       })
    }else{
        // public
        const writer = req.user.name;
        const date = fullTime;
        const public = 'Public';
        const AID = req.user._id
        const newNote = noteDB({note,public,writer,date,AID})
        newNote.save()
       .then(()=>{
        req.flash('down_msg','Note Save to Private Note.');
        res.redirect('/');
       })
       .catch((err)=> {
        req.flash('error_msg','Error While Saveing Note Save Again');
        res.redirect('/');
       })
    }
})



// link
app.post('/link',ensureAuthenticated,(req,res)=>{
    const {link,For} = req.body;
    const AID = req.user._id;
    const newLink = linkDB({link,AID,For})
    newLink.save()
    .then(()=>{
        req.flash('error','Links Save')
        res.redirect('/')
    })
    .catch(err => console.log(err))
})

app.post('/link-delete',ensureAuthenticated,(req,res)=>{
    const {AID} = req.body;
    linkDB.remove({_id:AID},(err,done)=>{
        req.flash('down_msg','link Delete Succssfuly');
        res.redirect('/')
    })
})


// change password
app.post('/change-password',ensureAuthenticated,(req,res)=>{
    const {currentPassword,newPassword} = req.body;
    bcrypt.compare(currentPassword, req.user.password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
          bcrypt.genSalt(10,(err,salt)=>{
              bcrypt.hash(newPassword,salt,(err,hash)=>{
                  if(err) throw err;
                  const id = req.user._id;
                  userDB.update({_id:id},{
                      $set : { password : hash}
                  })
                  .then(()=>{
                      req.flash('success_msg','Password Change Successfully.')
                      res.redirect('/logout')
                    })
                  .catch(err => console.log(err))
              })
          })  
        } else {
          req.flash('down_msg','Wrong Password');
          res.redirect('/account-settings')
        }
      });
})


// delete account
app.post('/delete-account',ensureAuthenticated,(req,res)=>{
    const {email,password} = req.body;
   if(req.user.email == email){
       bcrypt.compare(password,req.user.password,(err,isMatch)=>{
           if(err) throw err;
           if(isMatch){
               noteDB.remove({AID:req.user._id})
               linkDB.remove({AID:req.user._id})
               reminderDB.remove({AID:req.user._id})
               userDB.deleteOne({_id:req.user._id})
               .then(()=>{
                req.flash('error','Account is Delete');
                res.redirect('/logout')
               })
           }else{
               req.flash('error','Password Incoorect');
               res.redirect('/account-settings');
           }
       })
   }else{
       req.flash('error','incorrect Email');
       res.redirect('/account-settings');
   }
})






module.exports = app;
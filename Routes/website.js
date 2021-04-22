const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const PORT = process.env.PORT || 70;
// const { s3 , upload } = require('../config/multer') 
const { forwardAuthenticated , ensureAuthenticated } = require('../config/auth');

// init app
const app = express.Router();


const userDB = require('../Models/register');
const noteDB = require('../Models/note');
const reminderDB = require('../Models/reminder');
const linkDB = require('../Models/link');
const questionDB = require('../Models/question');
const anserDB = require('../Models/answer');


// routers
app.get('/', forwardAuthenticated, (req,res)=>{
    // res.render('home',{
    //     title : 'Home',
    //     nav : true
    // })
    res.redirect('https://work.vegihub.in')
})

app.get('/orignal',(req,res)=>{
    res.render('home',{
        title : 'Original Home',
        nav : true
    })
})


app.get('/login', (req,res)=>{
    res.render('login',{
        title : 'login',
        nav : true
    })
})

app.post('/register',(req,res)=>{
    const {name,nickName,email,password,date} = req.body;
    userDB.findOne({email},(err,user)=>{
        if(err) throw err;
        if(!user){
            const newUser = new userDB({name,nickName,email,password,date});
            bcrypt.genSalt(10,(err,salt)=>{
                if(err) throw err;
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
        }else{
            req.flash('message','This Email already Registered')
            res.redirect('/login')
        }
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
        if(err) throw err;
        res.render('shareWork',{
            title : 'ShareWork',
            nav : false,
            user : req.user,
            note
        })
    })
})

app.get('/note', ensureAuthenticated, (req,res)=>{
    const id = req.user._id;
    const URL = req.url;
    noteDB.find({AID:id},(err,note)=>{
        if(err) throw err;
        if(!note){
            req.flash('error_msg','No Note Present')
            res.redirect(`/${URL}`)
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
    questionDB.find({},(err,question)=>{
        if(err) throw err;
        anserDB.find({},(err,anser)=>{
            if(err) throw err;
            res.render('q&n',{
                title : 'Question',
                nav : false,
                user : req.user,
                question,
                anser
            })
        })
    })
})

// get request
app.get('/all-reminder',ensureAuthenticated, (req,res)=>{
    const AID = req.user._id;
    reminderDB.find({AID:AID},(err,reminder)=>{
        if(err) throw err;
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
    const URL = req.url;
    const PROTOCALL = req.protocol;
    const HOST = req.hostname;
    const current = PROTOCALL+'://'+HOST+PORT+URL
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
    if(reminder.length == 0){
        res.redirect('/all-reminder')
    }
    else{
        newReminder.save()
        .then(()=>{req.flash('down_msg','Your reminder set Successfuly')
        res.redirect(`${current}`)})
        .catch((err)=> console.log(err));
    }
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
       if(note.length == 0){
           res.redirect('/note')
       }else{
        newNote.save()
        .then(()=>{
         req.flash('down_msg','Note Save to Private Note.');
         res.redirect('/');
        })
        .catch((err)=> {
         if(err) throw err;
         req.flash('error_msg','Error While Saveing Note Save Again');
         res.redirect('/');
        })
       }
    }else{
        // public
        const writer = req.user.name;
        const date = fullTime;
        const public = 'Public';
        const AID = req.user._id
        const newNote = noteDB({note,public,writer,date,AID})
        if(note.length == 0){
            res.redirect('/note')
        }else{
            newNote.save()
            .then(()=>{
             req.flash('down_msg','Note Save to Private Note.');
             res.redirect('/');
            })
            .catch((err)=> {
             if(err) throw err;
             req.flash('error_msg','Error While Saveing Note Save Again');
             res.redirect('/');
            })
        }
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
        if(err) throw err;
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
            if(err) throw err;
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
});

// fotgot password
app.post('/forgot-password',(req,res)=>{
    const {email,password,date} = req.body;
    userDB.find({email:email},(err,user)=>{
        if(err) throw err;
        if(user.date == date){
           bcrypt.compare(password,user.password,(err,isMatch)=>{
               if(err) throw err;
               if(isMatch){
                   bcrypt.genSalt(10,(err,salt)=>{
                       if(err) throw err;
                       bcrypt.hash(password,salt,(err,hash)=>{
                           if(err) throw err;
                           userDB.update({_id:user._id},
                            {
                                $set: {password : hash}
                            }).then(()=>{
                                req.flash('success_msg','Password Change Successfully');
                                res.redirect('/');
                            }).catch((err => console.log(err)))
                       })
                   })
               }
           }) 
        }
        if(!user){
            req.flash('error','No Account found with this email !');
            res.redirect('/');
        }
    })
})

app.get('/all-user-info',(req,res)=>{
    userDB.find({},(err,user)=>{
        if(err) throw err;
       res.send(user)
    })
})

app.post('/delete-reminder',(req,res)=>{
    const {reminderId} = req.body;
    reminderDB.remove({_id:reminderId})
    .then(()=>{res.redirect('/')})
    .catch((err => console.log(err)))
})

app.post('/question-save',(req,res)=>{
    var time = new Date();
    var d = time.getDate(); // get Today Date
    var h = time.getHours()+6; // get Hours
    var m = time.getMinutes()-30; // get Minite
    var month = time.getMonth()+1;
    var year = time.getFullYear();
    var date;
    if(h < 12){
      date = d+"-"+month+"-"+year+" Time "+h+":"+m+" "+"AM";
    }else{
        h -=12;
      date = d+"-"+month+"-"+year+" Time "+h+":"+m+" "+"PM";
    }
    const {question,allotUser} = req.body;
    const AID = req.user.name;
    const newQuestion = new questionDB({AID,question,date,allotUser})
    newQuestion.save()
    .then(()=>{
        res.redirect('/q&a')
    })
    .catch(err => console.log(err))
})

app.post('/answer-save',(req,res)=>{
   const {questionID,userID,answer,allotUser} = req.body;
   const newAnswer = new anserDB({questionID,userID,answer,allotUser});
   newAnswer.save()
   .then(()=>{
       res.redirect('/q&a')
   })
   .catch(err => console.log(err))
})

app.get('/question-delete/:id',(req,res)=>{
    const { id } = req.params;
    questionDB.remove({ _id : id},(err,done)=>{
        if(!done){
            res.send(err)
        }else{
            res.redirect('/q&a')
        }
    })
})

// create team route
app.get('/team-management',(req,res)=>{
    res.render('team',{
        title : 'Team',
        user: req.user,
        nav : false
    })
})




module.exports = app;
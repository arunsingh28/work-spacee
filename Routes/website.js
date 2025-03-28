const express = require("express");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const { forwardAuthenticated, ensureAuthenticated } = require("../config/auth");
const { allFriend } = require("../config/friend");

// init app
const app = express.Router();

const userDB = require("../Models/register");
const noteDB = require("../Models/note");
const reminderDB = require("../Models/reminder");
const linkDB = require("../Models/link");
const questionDB = require("../Models/question");
const anserDB = require("../Models/answer");

// routers
app.get("/", forwardAuthenticated, (req, res) => {
  // return res.redirect("https://nervous-volhard-fadbc2.netlify.app");
  return res.render("home", {
    title: "Home",
    nav: true,
  });
});

app.get("/orignal", (req, res) => {
  res.render("home", {
    title: "Original Home",
    nav: true,
  });
});

app.get("/login", (req, res) => {
  res.render("login", {
    title: "login",
    nav: true,
  });
});

app
  .route("/register")
  .get((req, res) => {
    return res.render("register", { title: "Register", nav: true });
  })
  .post(async (req, res) => {
    const { name, nickName, email, password: plainText, date, img } = req.body;
    const d = new Date();
    let day = d.getDate();
    //cause month start from 0
    let mont = d.getMonth() + 1;
    let y = d.getUTCFullYear();
    const join = y + "-" + mont + "-" + day;
    const password = await bcrypt.hash(plainText, 10);

    try {
      userDB.findOne({ email }, async (err, user) => {
        if (user) {
          req.flash("error", "Email already in use");
          return res.redirect("/login");
        } else {
          const res = await userDB.create({
            name,
            nickName,
            email,
            password,
            date,
            img,
            join,
          });
        }
      });
    } catch (error) {
      if (error.code === 11000) {
        req.flash("error", "Email already in use.");
        return res.redirect("/login");
      }
      throw error;
    }
    res.json({ status: "ok" });
  });

app.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: `/dashboard`,
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next);
});

app.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", `👍 You are logout successfully.`);
  return res.redirect("/login");
});

app.get("/share-work", allFriend, ensureAuthenticated, (req, res) => {
  // let friends = req.userData
  noteDB.find({ type: "public" }, (err, note) => {
    if (err) throw err;
    res.render("shareWork", {
      title: "ShareWork",
      nav: false,
      user: req.user,
      note,
      // friends
    });
  });
});

app.get("/note", allFriend, ensureAuthenticated, (req, res) => {
  // let friends = req.userData
  const id = req.user._id;
  noteDB
    .find({ AID: id }, (err, note) => {
      if (err) throw err;
      if (!note) {
        req.flash("error", "No Note Present");
        return res.redirect("/");
      }
      res.render("note", {
        title: "Notes",
        nav: false,
        user: req.user,
        note: note,
        // friends
      });
    })
    .sort({ title: -1 });
});

// for deleting note
app.get("/note/d/:id", ensureAuthenticated, (req, res) => {
  const { id } = req.params;
  noteDB.remove({ _id: id }, (err, done) => {
    if (err) {
      req.flash("error", "Error occur while deleting note");
      return res.redirect("/note");
    } else {
      req.flash("success_msg", "👍 Note successfully deleted.");
      return res.redirect("/note");
    }
  });
});

app.get("/q&a", allFriend, ensureAuthenticated, (req, res) => {
  // let friends = req.userData
  questionDB.find({}, (err, question) => {
    if (err) throw err;
    anserDB.find({}, (err, anser) => {
      if (err) throw err;
      res.render("q&n", {
        title: "Question",
        nav: false,
        user: req.user,
        question,
        anser,
        // friends
      });
    });
  });
});

// get request
app.get("/all-reminder", allFriend, ensureAuthenticated, (req, res) => {
  // let friends = req.userData
  const AID = req.user._id;
  reminderDB.find({ AID: AID }, (err, reminder) => {
    if (err) throw err;
    res.render("reminder", {
      title: "Reminder",
      nav: false,
      user: req.user,
      reminder: reminder,
      // friends
    });
  });
});

// for editing note
app.post("/note/edit/:id", (req, res) => {
  const { id } = req.params;
  const { note } = req.body;
  noteDB
    .update(
      { _id: id },
      {
        $set: { note: note },
      }
    )
    .then(() => {
      req.flash("success_msg", "👍 Note successfully edited.");
      return res.redirect("/note");
    })
    .catch(() => {
      req.flash("error", "Error occur while editing note.");
      return res.redirect("/note");
    });
});

app.get("/what-is-next", ensureAuthenticated, (req, res) => {
  res.render("next", {
    title: "Next",
    nav: false,
    user: req.user,
  });
});

// post request
app.post("/reminder", ensureAuthenticated, (req, res) => {
  // time funciton
  var time = new Date();
  var d = time.getDate(); // get Today Date
  var h = time.getHours() + 6; // get Hours
  var m = time.getMinutes() - 30; // get Minite
  var month = time.getMonth() + 1;
  var year = time.getFullYear();
  var fullTime;
  if (h < 12) {
    fullTime =
      d + "-" + month + "-" + year + " Time " + h + ":" + m + " " + "AM";
  } else {
    h -= 12;
    fullTime =
      d + "-" + month + "-" + year + " Time " + h + ":" + m + " " + "PM";
  }
  const { reminder } = req.body;
  const AID = req.user._id;
  const date = fullTime;
  const newReminder = reminderDB({ reminder, AID, date });
  if (reminder.length == 0) {
    return res.redirect("/all-reminder");
  } else {
    newReminder
      .save()
      .then(() => {
        req.flash("success_msg", "👍 Reminder set successfully.");
        return res.redirect("/all-reminder");
      })
      .catch((err) => console.log(err));
  }
});

// settings
app.get("/account-settings", allFriend, ensureAuthenticated, (req, res) => {
  res.render("setting", {
    title: "Setting",
    user: req.user,
    nav: false,
  });
});

// saving notes
app.post("/save-note", ensureAuthenticated, (req, res) => {
  // time funciton
  var type;
  var time = new Date();
  var d = time.getDate(); // get Today Date
  var h = time.getHours() + 6; // get Hours
  var m = time.getMinutes() - 30; // get Minite
  var month = time.getMonth() + 1;
  var year = time.getFullYear();
  var date;
  if (h < 12) {
    date = d + "-" + month + "-" + year + " Time " + h + ":" + m + " " + "AM";
  } else {
    h -= 12;
    date = d + "-" + month + "-" + year + " Time " + h + ":" + m + " " + "PM";
  }
  const { note, visible } = req.body;
  const AID = req.user._id;
  const writer = req.user.name;
  if (visible === undefined) {
    type = "public";
    console.log(type);
    let newNote = noteDB({ note, type, date, AID, writer });
    newNote
      .save()
      .then(() => {
        req.flash("success_msg", "👍 This note is visiable to other users.");
        return res.redirect("/note");
      })
      .catch((e) => {
        req.flash("error", "something went wrong while saving public note");
        return res.redirect("/");
      });
    // .catch(err => console.log(err))
  } else {
    type = "private";
    console.log(type);
    let newNote = noteDB({ note, type, date, AID, writer });
    newNote
      .save()
      .then(() => {
        req.flash("success_msg", "👍 This note is visiable to you only.");
        return res.redirect("/note");
      })
      .catch((e) => {
        req.flash("error", "something went wrong while saving private note");
        return res.redirect("/");
      });
    // .catch(err => console.log(err))
  }
});

// link
app.post("/link", ensureAuthenticated, (req, res) => {
  const { link, For } = req.body;
  const AID = req.user._id;
  const newLink = linkDB({ link, AID, For });
  newLink
    .save()
    .then(() => {
      req.flash("success_msg", "👍 Link Save Successfully");
      return res.redirect("/");
    })
    .catch((err) => console.log(err));
});

app.post("/link-delete", ensureAuthenticated, (req, res) => {
  const { AID } = req.body;
  linkDB.remove({ _id: AID }, (err, done) => {
    if (err) throw err;
    req.flash("success_msg", "👍 link Delete Succssfuly");
    return res.redirect("/");
  });
});

// change password
app.post("/change-password", ensureAuthenticated, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  bcrypt.compare(currentPassword, req.user.password, (err, isMatch) => {
    if (err) throw err;
    if (isMatch) {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) throw err;
        bcrypt.hash(newPassword, salt, (err, hash) => {
          if (err) throw err;
          const id = req.user._id;
          userDB
            .update(
              { _id: id },
              {
                $set: { password: hash },
              }
            )
            .then(() => {
              req.flash("success_msg", "👍 Password Change Successfully.");
              return res.redirect("/logout");
            })
            .catch((err) => console.log(err));
        });
      });
    } else {
      req.flash("error", "wrong current password");
      return res.redirect("/account-settings");
    }
  });
});

// delete account
app.post("/delete-account", ensureAuthenticated, (req, res) => {
  const { email, password } = req.body;
  if (req.user.email == email) {
    bcrypt.compare(password, req.user.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {
        noteDB.remove({ AID: req.user._id });
        linkDB.remove({ AID: req.user._id });
        reminderDB.remove({ AID: req.user._id });
        userDB.deleteOne({ _id: req.user._id }).then(() => {
          req.flash("success_msg", "👍 Account delete successfully.");
          res.redirect("/logout");
        });
      } else {
        req.flash("error", "Password Incorect");
        res.redirect("/account-settings");
      }
    });
  } else {
    req.flash("error", "incorrect Email");
    res.redirect("/account-settings");
  }
});

app.get("/forgot-password", (req, res) => {
  res.render("forgot", {
    nav: true,
    title: "Recovery",
  });
});

// fotgot password
app.post("/forgot-password", (req, res) => {
  const { email, password, date, cpass } = req.body;
  if (password != cpass) {
    req.flash("error", "Password not match with Confirm password !");
    return res.redirect("/forgot-password");
  }
  userDB.findOne({ email }, (err, user) => {
    if (!user) {
      req.flash("error", "This email is not registered.");
      return res.redirect("/forgot-password");
    } else {
      if (user.date === date) {
        bcrypt.genSalt(10, (err, salt) => {
          if (err) throw err;
          bcrypt.hash(password, salt, (err, hash) => {
            if (err) throw err;
            userDB
              .update(
                { email },
                {
                  $set: { password: hash },
                }
              )
              .then(() => {
                req.flash("success_msg", "👍 Password shange successfully.");
                return res.redirect("/login");
              })
              .catch((err) => console.log(err));
          });
        });
      } else {
        req.flash("error", "Date of Birth is not match");
        return res.redirect("/forgot-password");
      }
    }
  });
});

// all user API
app.get("/all", async (req, res) => {
  const data = await userDB.find({});
  return res.json({ data: data });
});

app.post("/delete-reminder", (req, res) => {
  const { reminderId } = req.body;
  reminderDB
    .deleteOne({ _id: reminderId })
    .then(() => {
      return res.redirect("/dashboard");
    })
    .catch((err) => console.log(err));
});

app.post("/question-save", (req, res) => {
  var time = new Date();
  var d = time.getDate(); // get Today Date
  var h = time.getHours() + 6; // get Hours
  var m = time.getMinutes() - 30; // get Minite
  var month = time.getMonth() + 1;
  var year = time.getFullYear();
  var date;
  if (h < 12) {
    date = d + "-" + month + "-" + year + " Time " + h + ":" + m + " " + "AM";
  } else {
    h -= 12;
    date = d + "-" + month + "-" + year + " Time " + h + ":" + m + " " + "PM";
  }
  const { question, allotUser } = req.body;
  const AID = req.user.name;
  const newQuestion = new questionDB({ AID, question, date, allotUser });
  newQuestion
    .save()
    .then(() => {
      req.flash("success_msg", "👍 Question submited successfully.");
      return res.redirect("/q&a");
    })
    .catch(() => {
      req.flash(
        "error",
        "Errro occur while submiting question.Try Again letter"
      );
      return res.redirect("/q&a");
    });
});

app.post("/answer-save", (req, res) => {
  const { questionID, userID, answer, allotUser } = req.body;
  const newAnswer = new anserDB({ questionID, userID, answer, allotUser });
  newAnswer
    .save()
    .then(() => {
      req.flash("success_msg", "👍 Answer submited successfully.");
      return res.redirect("/q&a");
    })
    .catch(() => {
      req.flash("error", "Errro occur while submiting answer.Try Again letter");
      return res.redirect("/q&a");
    });
});

app.get("/question-delete/:id", (req, res) => {
  const { id } = req.params;
  questionDB.remove({ _id: id }, (err, done) => {
    if (!done) {
      req.flash(
        "error",
        "Something went wrong while deleting question try again after sometime."
      );
      return res.redirect("/q&a");
    } else {
      req.flash("success_msg", "👍 Question delete succesfully.");
      return res.redirect("/q&a");
    }
  });
});

// create team route
app.get("/team-management", (req, res) => {
  res.render("team", {
    title: "Team",
    user: req.user,
    nav: false,
  });
});

// search API
app.get("/s", (req, res) => {
  const q = req.query["term"];
  userDB
    .find({ name: { $regex: new RegExp(q), $options: "$i" } })
    .sort({ updated_at: -1 })
    .sort({ created_at: -1 })
    .then((data) => {
      var result = [];
      data.forEach((user) => {
        let obj = {
          id: user._id,
          username: user.nickName,
        };
        result.push(obj);
      });
      res.jsonp(result);
    })
    .catch((err) => console.log(err));
});

module.exports = app;

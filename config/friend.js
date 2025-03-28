const friend = require("../Models/friend");
const User = require("../Models/register");

module.exports = {
  allFriend: async (req, res, next) => {
    const id = req.user?._id;
    await friend.find({ user: id }, (err, data) => {
      if (err) {
        console.log("Error from friend module :" + err);
      }
      if (data) {
        data.map((i) => {
          console.log(i.friends);
          User.find({ _id: i.friends }, (err, userData) => {
            req.userData = {
              ...userData[0],
              // id: userData[0]?._id || "",
              // name: userData[0]?.name || "",
              // email: userData[0]?.email || "",
              // nickName: userData[0]?.nickName || "",
              // image: userData[0]?.image || "",
            };
            return next();
          });
        });
      } else {
        req.flash("error", "Error Occur while proccssing request");
        return res.redirect("/login");
      }
    });
  },
};

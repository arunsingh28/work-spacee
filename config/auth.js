module.exports = {
  ensureAuthenticated: (req, res, next) => {
    console.log('ensure\n\n')
    // next()
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Please log in to view that resource');
    return res.redirect('/login');
  },
  forwardAuthenticated: (req, res, next) => {
    if (!req.isAuthenticated()) {
      return next();
    }
    return res.redirect('/dashboard');
  }
};

var passport = require('passport'); // calls passport
var LocalStrategy = require('passport-local').Strategy; // uses local strategy
var mongoose = require('mongoose'); // for managing the database
var User = mongoose.model('User'); //using the User model


passport.use(new LocalStrategy({
    usernameField: 'user[email]',
    passwordField: 'user[password]'
}, function(email, password, done) {
    User.findOne({ email: email }).then(function(user) {
        if (!user || !user.validPassword(password)) {
            return done(null, false, { errors: { 'email or password': 'is invalid' } });
        }

        return done(null, user);
    }).catch(done);
}));
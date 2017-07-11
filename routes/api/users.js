var mongoose = require('mongoose'); // modeling and mapping MongoDB data to javascript
var router = require('express').Router(); // define a router using the express router
var passport = require('passport'); // for authentication
var User = mongoose.model('User'); // our local User model
var auth = require('../auth');


/* Lets set up some User api routes to call */
/* User GET */
router.get('/user', auth.required, function(req, res, next) {
    User.findById(req.payload.id).then(function(user) {
        if (!user) { return res.sendStatus(401); }

        return res.json({ user: user.toAuthJSON() });
    }).catch(next);
});

/* User PUT */
router.put('/user', auth.required, function(req, res, next) {
    User.findById(req.payload.id).then(function(user) {
        if (!user) { return res.sendStatus(401); }

        // only update fields that were actually passed
        if (typeof req.body.user.username !== 'undefined') {
            user.username = req.body.user.username;
        }
        if (typeof req.body.user.email !== 'undefined') {
            user.email = req.body.user.email;
        }
        if (typeof req.body.user.bio !== 'undefined') {
            user.bio = req.body.user.bio;
        }
        if (typeof req.body.user.image !== 'undefined') {
            user.image = req.body.user.image;
        }
        if (typeof req.body.user.password !== 'undefined') {
            user.setPassword(req.body.user.password);
        }

        return user.save().then(function() {
            return res.json({ user: user.toAuthJSON() });
        });
    }).catch(next);
});


/* User/Login POST   */
router.post('/users/login', function(req, res, next) {
    if (!req.body.user.email) {
        return res.status(422).json({ errors: { email: "can't be blank" } });
    }

    if (!req.body.user.password) {
        return res.status(422).json({ errors: { password: "can't be blank" } });
    }
    // using local strategy from passport
    passport.authenticate('local', { session: false }, function(err, user, info) {
        if (err) { return next(err); }

        if (user) {
            user.token = user.generateJWT();
            return res.json({ user: user.toAuthJSON() });
        } else {
            return res.status(422).json(info);
        }
    })(req, res, next);
});


/* User POST */
router.post('/users', function(req, res, next) {
    var user = new User();

    user.username = req.body.user.username;
    user.email = req.body.user.email;
    user.setPassword(req.body.user.password);

    user.save().then(function() {
        return res.json({ user: user.toAuthJSON() });
    }).catch(next);
});


// export the router module so the system can use it
module.exports = router;
var router = require('express').Router(); // define a router using the express router
var mongoose = require('mongoose'); // modeling and mapping MongoDB data to javascript
var User = mongoose.model('User'); // our local User model
var auth = require('../auth'); // sets up the JWTokens


// Preload article objects on routes with ':username'
router.param('username', function(req, res, next, username) {
    User.findOne({ username: username }).then(function(user) {
        if (!user) { return res.sendStatus(404); }

        req.profile = user;

        return next();
    }).catch(next);
});


router.get('/:username', auth.optional, function(req, res, next) {
    if (req.payload) {
        User.findById(req.payload.id).then(function(user) {
            if (!user) { return res.json({ profile: req.profile.toProfileJSONFor(false) }); }

            return res.json({ profile: req.profile.toProfileJSONFor(user) });
        });
    } else {
        return res.json({ profile: req.profile.toProfileJSONFor(false) });
    }
});


// export the router module so the system can use it
module.exports = router;
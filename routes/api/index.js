// define a router using the express router
var router = require('express').Router();

// setup to use
router.use('/', require('./users'));


router.use(function(err, req, res, next) {
    if (err.name === 'ValidationError') {
        return res.status(422).json({
            errors: Object.keys(err.errors).reduce(function(errors, key) {
                errors[key] = err.errors[key].message;

                return errors;
            }, {})
        });
    }

    return next(err);
});


// export the router module so the system can use it
module.exports = router;
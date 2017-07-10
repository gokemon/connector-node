var router = require('express').Router();

router.use('/api', require('./api'));

// export the router module so the system can use it
module.exports = router;
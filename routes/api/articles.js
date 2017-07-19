var mongoose = require('mongoose'); // modeling and mapping MongoDB data to javascript
var router = require('express').Router(); // define a router using the express router
var passport = require('passport'); // for authentication

var Article = mongoose.model('Article');
var User = mongoose.model('User'); // our local User model
var auth = require('../auth'); // sets up the JWTokens


// Preload article objects on routes with ':article'
router.param('article', function(req, res, next, slug) {
    Article.findOne({ slug: slug })
        .populate('author')
        .then(function(article) {
            if (!article) { return res.sendStatus(404); }

            req.article = article;

            return next();
        }).catch(next);
});



/*  create an article */
router.post('/', auth.required, function(req, res, next) {
    User.findById(req.payload.id).then(function(user) {
        if (!user) { return res.sendStatus(401); }

        var article = new Article(req.body.article);

        article.author = user;

        return article.save().then(function() {
            console.log(article.author);
            return res.json({ article: article.toJSONFor(user) });
        });
    }).catch(next);
});


/* read an article  */
router.get('/:article', auth.optional, function(req, res, next) {
    Promise.all([
        req.payload ? User.findById(req.payload.id) : null,
        req.article.populate('author').execPopulate()
    ]).then(function(results) {
        var user = results[0];

        return res.json({ article: req.article.toJSONFor(user) });
    }).catch(next);
});


/* update article  */
router.put('/:article', auth.required, function(req, res, next) {
    if (req.article._id.toString() === req.payload.id.toString()) {
        if (typeof req.body.article.title !== 'undefined') {
            req.article.title = req.body.article.title;
        }

        if (typeof req.body.article.description !== 'undefined') {
            req.article.description = req.body.article.description;
        }

        if (typeof req.body.article.body !== 'undefined') {
            req.article.body = req.body.article.body;
        }

        req.article.save().then(function(article) {
            return res.json({ article: article.toJSONFor(user) });
        }).catch(next);
    } else {
        return res.send(403);
    }
});


/* delete article */
router.delete('/:article', auth.required, function(req, res, next) {
    User.findById(req.payload.id).then(function() {
        if (req.article.author.toString() === req.payload.id.toString()) {
            return req.article.remove().then(function() {
                return res.sendStatus(204);
            });
        } else {
            return res.sendStatus(403);
        }
    });
});


/* routes for favoriting articles */
// Favorite an article
router.post('/:article/favorite', auth.required, function(req, res, next) {
    var articleId = req.article._id;

    User.findById(req.payload.id).then(function(user) {
        if (!user) { return res.sendStatus(401); }

        return user.favorite(articleId).then(function() {
            return req.article.updateFavoriteCount().then(function(article) {
                return res.json({ article: article.toJSONFor(user) });
            });
        });
    }).catch(next);
});


// Unfavorite an article
router.delete('/:article/favorite', auth.required, function(req, res, next) {
    var articleId = req.article._id;

    User.findById(req.payload.id).then(function(user) {
        if (!user) { return res.sendStatus(401); }

        return user.unfavorite(articleId).then(function() {
            return req.article.updateFavoriteCount().then(function(article) {
                return res.json({ article: article.toJSONFor(user) });
            });
        });
    }).catch(next);
});



// export the router module so the system can use it
module.exports = router;
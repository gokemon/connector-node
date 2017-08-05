var mongoose = require('mongoose'); // modeling and mapping MongoDB data to javascript
var router = require('express').Router(); // define a router using the express router
var passport = require('passport'); // for authentication

var Comment = mongoose.model('Comment'); // Attached to Article
var Article = mongoose.model('Article'); // Attached to User
var User = mongoose.model('User'); // our local User model
var auth = require('../auth'); // sets up the JWTokens


/* Preload article objects on routes with ':article' */
router.param('article', function(req, res, next, slug) {
    Article.findOne({ slug: slug })
        .populate('author')
        .then(function(article) {
            if (!article) { return res.sendStatus(404); }

            req.article = article;

            return next();
        }).catch(next);
});


/* Preload comment objects on routes with ':comment' */
router.param('comment', function(req, res, next, id) {
    Comment.findById(id).then(function(comment) {
        if (!comment) { return res.sendStatus(404); }

        req.comment = comment;

        return next();
    }).catch(next);
});


/*===== Article CRUD Routes Section =====*/
/* Create an article */
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


/* Read an article  */
router.get('/:article', auth.optional, function(req, res, next) {
    Promise.all([
        req.payload ? User.findById(req.payload.id) : null,
        req.article.populate('author').execPopulate()
    ]).then(function(results) {
        var user = results[0];

        return res.json({ article: req.article.toJSONFor(user) });
    }).catch(next);
});


/* Update article  */
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


/* Delete article */
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
/*===== Article CRUD Routes Section =====*/


/*===== Routes for Favoriting Articles Section =====*/
/* Favorite an article */
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


/* Unfavorite an article */
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
/*===== Routes for Favoriting Articles Section =====*/


/*===== Comments CRUD Routes Section =====*/
/* Read an article's comments */
router.get('/:article/comments', auth.optional, function(req, res, next) {
    Promise.resolve(req.payload ? User.findById(req.payload.id) : null).then(function(user) {
        return req.article.populate({
            path: 'comments',
            populate: {
                path: 'author'
            },
            options: {
                sort: {
                    createdAt: 'desc'
                }
            }
        }).execPopulate().then(function(article) {
            return res.json({
                comments: req.article.comments.map(function(comment) {
                    return comment.toJSONFor(user);
                })
            });
        });
    }).catch(next);
});



/* Create a comment */
router.post('/:article/comments', auth.required, function(req, res, next) {
    User.findById(req.payload.id).then(function(user) {
        if (!user) { return res.sendStatus(401); }

        var comment = new Comment(req.body.comment);
        comment.article = req.article;
        comment.author = user;

        return comment.save().then(function() {
            req.article.comments.push(comment);

            return req.article.save().then(function(article) {
                res.json({ comment: comment.toJSONFor(user) });
            });
        });
    }).catch(next);
});


/* Update a comment */
// we won't be updating comments, no need to


/* Delete a comment */
router.delete('/:article/comments/:comment', auth.required, function(req, res, next) {
    if (req.comment.author.toString() === req.payload.id.toString()) {
        req.article.comments.remove(req.comment._id);
        req.article.save()
            .then(Comment.find({ _id: req.comment._id }).remove().exec())
            .then(function() {
                res.sendStatus(204);
            });
    } else {
        res.sendStatus(403);
    }
});
/*===== Comments CRUD Routes Section =====*/


// export the router module so the system can use it
module.exports = router;
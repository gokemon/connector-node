// modeling and mapping MongoDB data to javascript
var mongoose = require('mongoose');
// Adds unique validation tools
var uniqueValidator = require('mongoose-unique-validator');
// this is our special baby here
var slug = require('slug');
// connecting a User and article
var User = mongoose.model('User');


// setup a new mongo database schema via mongoose
var ArticleSchema = new mongoose.Schema({
    slug: { type: String, lowercase: true, unique: true },
    title: String,
    description: String,
    body: String,
    favoritesCount: { type: Number, default: 0 },
    // lets add comments in
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    tagList: [{ type: String }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });


ArticleSchema.plugin(uniqueValidator, { message: 'is already taken' });


ArticleSchema.pre('validate', function(next) {
    this.slugify();

    next();
});


/* setup some methods */
ArticleSchema.methods.slugify = function() {
    this.slug = slug(this.title);
};


// updateFavoriteCount method
ArticleSchema.methods.updateFavoriteCount = function() {
    var article = this;

    return User.count({ favorites: { $in: [article._id] } }).then(function(count) {
        article.favoritesCount = count;

        return article.save();
    });
};


/* setup some methods */
ArticleSchema.methods.toJSONFor = function(user) {
    return {
        slug: this.slug,
        title: this.title,
        description: this.description,
        body: this.body,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        tagList: this.tagList,
        favoritesCount: this.favoritesCount,
        author: this.author.toProfileJSONFor(user)
    };
};


/* registers the schema with mongoose */
mongoose.model('Article', ArticleSchema);
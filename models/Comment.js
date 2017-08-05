// modeling and mapping MongoDB data to javascript
var mongoose = require('mongoose');


/* tie the Comments, Authors and Articles together */
var CommentSchema = new mongoose.Schema({
    body: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' }
}, { timestamps: true });


/* Requires population of author */
CommentSchema.methods.toJSONFor = function(user) {
    return {
        id: this._id,
        body: this.body,
        createdAt: this.createdAt,
        author: this.author.toProfileJSONFor(user)
    };
};


/* registers the schema with mongoose */
mongoose.model('Comment', CommentSchema);
/*  The user model can be accessed anywhere in the
    application by calling   mongoose.model('User') */
var mongoose = require('mongoose');
// Adds unique validation tools
var uniqueValidator = require('mongoose-unique-validator');
// generate and validate hashes with the  pbkdf2 algorithm in crypto
var crypto = require('crypto');
// for generating a JWT (JSON Web Tokens)
var jwt = require('jsonwebtoken');
var secret = require('../config').secret;

// setup a new mongo database schema via mongoose
var UserSchema = new mongoose.Schema({
        username: {
            type: String,
            lowercase: true,
            unique: true,
            required: [true, "can't be blank"],
            match: [/^[a-zA-Z0-9]+$/, 'is invalid'],
            index: true
        },
        email: {
            type: String,
            lowercase: true,
            unique: true,
            required: [true, "can't be blank"],
            match: [/\S+@\S+\.\S+/, 'is invalid'],
            index: true
        },
        bio: String,
        image: String,
        hash: String,
        salt: String
    },
    // creates a createdAt and updatedAt field
    { timestamps: true }
);


// Adds unique validation to email and username fields
UserSchema.plugin(uniqueValidator, { message: 'is already taken.' });


/* Method to hash passwords. 
generate a random salt for each user.  
use crypto.crypto.pbkdf2Sync() to generate hashes using the salt. 
pbkdf2Sync() takes five parameters: 
The password to hash, the salt, the iteration (number of times to hash the password), 
the length (how long the hash should be), and the algorithm.
*/
// method for setting passwords
UserSchema.methods.setPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};


// method to validate passwords
UserSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
};


// user model method  to generate a JWT
UserSchema.methods.generateJWT = function() {
    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate() + 60); // 60 days in the future
    // exp is a UNIX timestamp in seconds that determines when the token will expire
    return jwt.sign({
        // token's payload of database id of the user,  username, and exp
        id: this._id,
        username: this.username,
        exp: parseInt(exp.getTime() / 1000),
    }, secret);
};


// method to get the JSON representation of a user for authentication
UserSchema.methods.toAuthJSON = function() {
    return {
        username: this.username,
        email: this.email,
        token: this.generateJWT(),
        bio: this.bio,
        image: this.image
    };
};


UserSchema.methods.toProfileJSONFor = function(user) {
    return {
        username: this.username,
        bio: this.bio,
        image: this.image || 'https://en.wikipedia.org/wiki/Smiley#/media/File:SNice.svg',
        following: false
    };
};


/* registers the schema with mongoose */
mongoose.model('User', UserSchema);
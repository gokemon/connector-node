//  essentially the password to your JWT

module.exports = {
    // secret: process.env.NODE_ENV === 'production' ? process.env.SECRET : 'secret'
    secret: process.env.NODE_ENV === 'production' ? process.env.SECRET : 'secret-sauce'
};
# connector-node
Connector is a reverse-engineered clone of the social blogging site Medium.com which includes; 

- Authentication with JWT(JSON Web Token)
- Profiles with images
- Write/edit/read articles
- Comments on articles
- Ability to "favorite" articles
- Ability to follow other users & have their articles show up in your feed

I am building it with an Angular front-end and a Nodejs back-end. This is the Node back-end version. I plan to keep the front-end & back-end codebase separated from each other and communicate through a RESTful API with full CRUD (Create Read Update Delete) operations. 

Some of Connector's "user story" functionality includes creating an account, posting an article, and editing. 

Node as my API, using Express for server logic and MongoDB for the database. So its set up as a MEN-stack.

----------
Please check out the API Design Specs readme, which covers; 

- **Authentication**, 
- **User Profiles**, 
- **Articles**, 
- **Comments**, 
- **Tags**,
- **Lists**. 


----------

Branches

Based on the API above, I think I should set-up my planned branches here.

- 01-setup  
- 02-user-model   
- 03-auth-middleware * 
- 04-auth-routes   
- 05-profiles   
- 06-articles  
- 07-favorites   
- 08-comments   
- 09-following   
- 10-tags
- 11-tests **

 * This is about as far as I think I can go in the first sprint.

 ** I realized about branch 6, that I needed to and could build tests on this
----------
nodemon app.js

# Code Overview

## Dependencies

- [expressjs](https://github.com/expressjs/express) - Server middleware for handling and routing HTTP requests
- [express-jwt](https://github.com/auth0/express-jwt) - Middleware for validating JWTs for authentication
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) - For generating JWTs used by authentication
- [mongoose](https://github.com/Automattic/mongoose) - For modeling and mapping MongoDB data to javascript 
- [mongoose-unique-validator](https://github.com/blakehaswell/mongoose-unique-validator) - For handling unique validation errors in Mongoose. Mongoose only handles validation at the document level, so a unique index across a collection will throw an exception at the driver level. The `mongoose-unique-validator` plugin helps us by formatting the error like a normal mongoose `ValidationError`.
- [passport](https://github.com/jaredhanson/passport) - For handling user authentication
- [slug](https://github.com/dodo/node-slug) - For encoding titles into a URL-friendly format


## Unit Testing

I need to start building some tests for this.
I know that I have the stuff in my toolbox somewhere to do that. I just need to dig it out and start building some tests.



## Application Structure

- `server.js` - Application entry point. This file defines the express server and connects it to MongoDB using mongoose. It also requires the routes and models I'm creating.
- `config/` - Folder containing configuration for passport as well as a central location for configuration/environment variables.
- `routes/` - Folder containing the route definitions for my API.
- `models/` - Folder containing  the schema definitions for my Mongoose models.
- `connector-api` - The Application Folder into which I plan to fold the routes and models into. The config folder stays outside of this.

----------

### Credits

**Sites** that have assisted me in my studies of this project

- https://jwt.io/introduction/
- https://scotch.io/tutorials/authenticate-a-node-js-api-with-json-web-tokens
- http://blog.getpostman.com/2014/03/07/writing-automated-tests-for-apis-using-postman/
- https://scotch.io/tutorials/using-mongoosejs-in-node-js-and-mongodb-applications
- https://github.com/Cody2333/generator-node-rest-api
- https://github.com/diegohaz/rest
- https://github.com/ndelvalle/generator-api
- https://github.com/EthanRBrown/web-development-with-node-and-express

**Books**

- Web Development with MongoDB and NodeJS
- Express in Action, 2016 by Manning Publications
- Express.js Blueprints, 2015


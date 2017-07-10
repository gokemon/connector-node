Connector is a reengineered clone of the social blogging site Medium.com. 

Connector is a fully featured social blogging site including:

- Authentication with JWT(JSON Web Token)
- Profiles with images
- Write/edit/read articles
- Comments on articles
- Ability to "favorite" articles
- Ability to follow other users & have their articles show up in your feed

Bear with me. This is my first version of the **API Design Specs**, which covers; 

- **Authentication**, 
- **User Profiles**, 
- **Articles**, 
- **Comments**, 
- **Tags**,
- **Lists**. 


----------



# API Design Specs #

For validation errors that need to be sent back to the client, I'll use status code 422 and errors in the following format:

    {
      "errors":{
	    "body": [
	      "can't be empty"
	    ]
      }
    }


Having the errors keyed by the field name allows the frontend to highlight the specific field that is breaking.

Other status codes:

401 for Unauthorized requests, when a request requires authentication but it isn't provided

403 for Forbidden requests, when a request may be valid but the user doesn't have permissions to perform the action

404 for Not found requests, when a resource can't be found to fulfill the request


## Authentication ##

A user has a username, image, bio, email and a password. I don't return a password from the server, but the other fields (plus their JWT token) are returned.

**User object**

    {
     "user": {
      "email": "michael@example.com",
      "token": "jwt.token.here",
      "username": "gokemon",
      "bio": "I have super powers",
      "image": null
      }
    }

**Registration**

To register, requires an email, password, and desired username:

    POST /api/users

Seen here;

    {
     "user":{
      "username": "gokemon"
      "email": "michael@example.com",
      "password": "aBc!23"
      }
    }


**Login**

To login, we only require an email and password:

    POST /api/users/login

Seen here;

    {
     "user":{
      "email": "michael@example.com",
      "password": "aBc!23"
     }
    }

**Getting the current user's data**

To get the current user's info. Required authentication token.

    GET /api/user

Returns a User object


**Updating the current user's data**

Update to bio, pic, name, etc

    PUT /api/user

Authentication required, returns the updated User object

Example request body:

    {
    "user":{
    	"email": "michael@example.com",
    	"bio": "I have super powers",
    	"image": "https://i.stack.imgur.com/smiley-cyrus.jpg"
      }
    }

Accepted fields: `email`, `username`, `password`, `image`, `bio`




## Showing public user data for Profiles ##

Since I want users to view the profile of another user on our site, I don't want to expose their email nor allow others to change their password, which is why those API endpoints are private. I'll need to create API endpoints that will only expose public data about the user.

First I'll need to create a new object for **Profiles**:

    {
      "profile": {
	    "username": "gokemon",
	    "bio": "I have super powers",
	    "image": "https://i.stack.imgur.com/smiley-cyrus.jpg",
	    "following": false
      }
    }


**Getting a user's public profile**

    GET /api/profiles/:username

Authentication optional, returns a Profile

The other actions we can do with a profile is to follow and unfollow it.


**Follow a user**

    POST /api/profiles/:username/follow

Authentication required, returns a Profile No additional parameters required


**Unfollow a user**

    DELETE /api/profiles/:username/follow

Authentication required, returns a Profile No additional parameters required


## Articles ##

Next I need to create a spec for the article data.

{
  "article": {
    "slug": "band-of-brothers",
    "title": "Band of Brothers",
    "description": "Easy Company in WWII",
    "body": "It takes a Village",
    "createdAt": "2017-06-18T03:22:56.637Z",
    "updatedAt": "2017-06-18T03:48:35.824Z",
    "favorited": false,
    "favoritesCount": 0,
    "author": {
      "username": "gokemon",
      "bio": "I have super powers",
      "image": "https://i.stack.imgur.com/smiley-cyrus.jpg",
      "following": false
    }
  }
}


**Create Article**

    POST /api/articles

Example request body:

{
  "article": {
    "title": "Band of Brothers",
    "description": "Easy Company in WWII",
    "body": "It takes a Village",
    "tagList": ['Yanks', 'Brits', 'Jerrys']
  }
}

Authentication required, will return an Article

Required fields: title, description, body

Optional fields: tagList as an array of Strings


**Retrieve Article**

    GET /api/articles/:slug

No authentication required, will return single article


**Update article**

    PUT /api/articles/:slug

Example request body:

    {
      "article": {
    	"title": "Band of Brothers"
      }
    }

Authentication required, returns the updated Article

Optional fields: title, description, body

The slug also gets updated when the title is changed


**Deleting an article**

    DELETE /api/articles/:slug

Authentication required

Associated actions with articles

Users can favorite articles -- so lets create endpoints that deal with that.


**Favoriting an article**

    POST /api/articles/:slug/favorite

Authentication required, returns the Article

No additional parameters required


**Unfavoriting an article**

    DELETE /api/articles/:slug/favorite

Authentication required, returns the Article

No additional parameters required


### Comments

Here's my spec for article comments :

    {
      "comment": {
	    "id": 1,
	    "body": "It takes a Village",
	    "createdAt": "2017-06-18T03:22:56.637Z",
	    "author": {
	      "username": "gokemon",
	      "bio": "I have super powers",
	      "image": "https://i.stack.imgur.com/smiley-cyrus.jpg",
	      "following": false
	    }
      }
    }

**Creating comments on an article**

    POST /api/articles/:slug/comments

Example request body:

{
  "comment": {
    "body": "Brothers to the End"
  }
}
Authentication required, returns the created Comment

Required fields: body


**Deleting a comment**

    DELETE /api/articles/:slug/comments/:id

Authentication required



**Getting comments of an article**

    GET /api/articles/:slug/comments

Authentication not needed, returns multiple comments

This is different from any of the other endpoints, because its going to receive a collection of them back instead of just one comment. I need to create a new spec like this:

    {
      "comments": [{
	    "id": 1,
	    "body": "It takes a Village",
	    "createdAt": "2017-06-18T03:22:56.637Z",
	    "author": {
	      "username": "gokemon",
            "bio": "I have super powers",
	        "image": "https://i.stack.imgur.com/smiley-cyrus.jpg",
	      "following": false
	    }
      }]
    }


### Tags 

Tags are created when articles are created, and deleted when no articles are using them any more. On my home page I want to show a list of all the tags, so I'll need an endpoint for that.


**Getting tags**

    GET /api/tags

I'll need to return a list of tags (similar to what I do with comments), so create a spec for it:

    {
      "tags": [
	    "NodeJS",
        "ExpressJS",
	    "Angular"
      ]
    }

## Lists ##

I know I want to list out articles that can be paginated and sorted based on author, tags, etc. That API spec for returning multiple articles looks like this:

    {
      "articles":[{
        "slug": "band-of-brothers",
        "title": "Band of Brothers",
        "description": "Easy Company in WWII",
        "body": "It takes a Village",
        "createdAt": "2017-06-18T03:22:56.637Z",
        "updatedAt": "2017-06-18T03:48:35.824Z",
	    "favorited": false,
	    "favoritesCount": 0,
	    "author": {
	      "username": "gokemon",
	      "bio": "I have super powers",
	      "image": "https://i.stack.imgur.com/smiley-cyrus.jpg",
	      "following": false
	    }
	      }, {
	    "description": "Searchable Exhibit",
	    "slug": "medal-of-honor-exhibit",
	    "title": "Medal of Honor Exhibit",
	    "tagList": ["honor", "valor"],
	    "createdAt": "2016-04-18T03:22:56.637Z",
	    "updatedAt": "2016-0-18T03:48:35.824Z",
	    "favorited": false,
	    "favoritesCount": 0,
	    "author": {
	      "username": "gokemon",
	      "bio": "I have super powers",
	      "image": "https://i.stack.imgur.com/smiley-cyrus.jpg",
	      "following": false
	    }
      }],
      "articlesCount": 2
    }


**List Articles**

    GET /api/articles

Returns most recent articles globally be default, provide tag, author or favorited query parameter to filter results


### Query Parameters:

*Filter by tag:*

    ?tag=AngularJS


*Filter by author:*

    ?author=gokemon


*Favorited by user:*

    ?favorited=gokemon


*Limit number of articles (default is 10):*

    ?limit=10


*Offset/skip number of articles:*

    ?offset=0

Authentication optional, will return multiple articles, ordered by most recent first


**Feed articles**

    GET /api/articles/feed

Can also take limit and offset query parameters like List Articles

Authentication required, will return multiple articles created by followed users, ordered by most recent first.
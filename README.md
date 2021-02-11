# Reactory #
* Full stack web site
## Specifications: ##
* Supports user registration, login and logout.
* Room system for playing [Okey](https://en.wikipedia.org/wiki/Okey).
* See heroku branch for source code for web site
## Dependencies: ##
* React
* Express
* mysql
* socket.io
* jsonwebtoken
* and more
## Run: ##
* `npm install && npm start` for running server, `npm install && npm start` for running client. 
* `npm install && npm run build` then `npm start` for only running server and hosting static files (for heroku branch).
## Design: ##
* [@ogoregen](https://github.com/ogoregen)
### Bugs and Limitations: ###
* I didn't use database on Heroku, so room listing is limited.
* Sometimes unexpected things happen like not joining the room again. I think this is due to delay on sockets.

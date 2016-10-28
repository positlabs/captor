# express-o

Boilerplate stuff for express projects. Includes...

- livereload for styles
- es6 client-side javascript
- local pm2 server for keeping logs and automatically restarting when files change


## Installation

[Download ZIP](https://github.com/positlabs/express-o/archive/master.zip)

Or run this command to install into the current directory. 

```bash
curl -LO https://github.com/positlabs/express-o/archive/master.zip && unzip master.zip && rm master.zip && cp -R express-o-master/ ./ && rm -R ./express-o-master
```

## Development

### CLI Tools

- Install [NodeJS](https://nodejs.org/en/) LTS version, and update package.json's engines field if necessary

- Install [PM2](https://github.com/Unitech/pm2). This allows us to edit server files and automatically restart the server to pick up new changes. Also keeps logs organized, and can run in the background.

### Setup

`npm install`: install node_modules

### Local server

`npm run start-local`: start a dev server on localhost:3000, and show logs

Edit local server config in ./dev/env/local.json

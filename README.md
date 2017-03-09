react-apollo-koa-example
========================

An example app using React, Apollo and Koa.

Setup
-----

Install [Node.js](https://nodejs.org/) and [Caddy](https://caddyserver.com/).
Caddy is used as the reverse proxy.

```sh
% npm install
```

Copy `.env.default` to `.env` and edit it.

Copy `config-default.json` to `config.json` and edit it.

Copy `Caddyfile-dev` to `Caddyfile` and edit it.

Usage
-----

Launch the server:

```sh
% npm run server
```

Launch the development web server which serves the static client-side files:

```sh
% npm start
```

Launch Caddy:

```sh
% caddy
```

Open the URL (e.g. `http://localhost:8000`) in your browser.

Frameworks/Libraries
--------------------

### Client-side

* [React](https://facebook.github.io/react/)
* [Redux](http://redux.js.org/)
* [react-router](https://github.com/ReactTraining/react-router) and
  [react-router-redux](https://github.com/reactjs/react-router-redux)
* [redux-logic](https://github.com/jeffbski/redux-logic) (Business logic management)
* [react-app-rewired](https://github.com/timarney/react-app-rewired)
  (Customizing create-react-app w/o ejection)
* [Apollo](http://dev.apollodata.com/) (GraphQL)
* [Semantic-UI-React](http://react.semantic-ui.com/) (CSS framework)

The application code was generated by create-react-app.

See package.json for more information.

### Server-side

* [koa v.2](https://github.com/koajs/koa)
* [Apollo](http://dev.apollodata.com/) (GraphQL)

See package.json for more information.
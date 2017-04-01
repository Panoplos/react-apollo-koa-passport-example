// @flow
import R from 'ramda'
import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import { replace, syncHistoryWithStore } from 'react-router-redux'
import { UserAuthWrapper } from 'redux-auth-wrapper'
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws'
import { ApolloProvider } from 'react-apollo'
import WebClient from './WebClient'
import App from './containers/App'
import HomeApp from './containers/Home/HomeApp'
import SigninApp from './containers/Signin/SigninApp'
import TodoApp from './containers/Todo/TodoApp'
import RemoteTodoApp from './containers/RemoteTodo/RemoteTodoApp'
import PubSubTodoApp from './containers/PubSubTodo/PubSubTodoApp'
import NotFound from './components/NotFound'
import configureStore from './redux/store'
import createApolloClient from './apollo/create-apollo-client'
import getNetworkInterface from './apollo/transport'
import { signinResume, usernamePath } from './ducks/auth'
import { initialState as todoInitialState } from './ducks/todo'
import config from '../config.json'

import './index.css'

const initialState = {
  todo: todoInitialState
}

const wsClient = new SubscriptionClient(config.wsURL, {
  reconnect: true,
  connectionParams: {}
})

const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  getNetworkInterface(config.graphqlURL, {}),
  wsClient
)

const apolloClient = createApolloClient({
  networkInterface: networkInterfaceWithSubscriptions,
  initialState: window.__APOLLO_STATE__,
  ssrForceFetchDelay: 100
})

const webClient = new WebClient()

const store = configureStore(initialState, apolloClient, webClient)
const history = syncHistoryWithStore(browserHistory, store)

const withAuth = UserAuthWrapper({
  authSelector: state => state.auth,
  predicate: auth => !!R.path(usernamePath, auth),
  redirectAction: replace,
  allowRedirectBack: true,
  failureRedirectPath: '/signin',
  wrapperDisplayName: 'withAuth'
})

const withoutAuth = UserAuthWrapper({
  authSelector: state => state.auth,
  predicate: auth => !R.path(usernamePath, auth),
  redirectAction: replace,
  allowRedirectBack: false,
  failureRedirectPath: (state, ownProps) => ownProps.location.query.redirect || '/',
  wrapperDisplayName: 'withoutAuth'
})

const accessToken = localStorage.getItem('accessToken')
if (accessToken) {
  store.dispatch(signinResume())
}

ReactDOM.render(
  <ApolloProvider store={store} client={apolloClient}>
    <Router history={history}>
      <Route path="/" component={App}>
        <IndexRoute component={HomeApp} />
        <Route path="signin" component={withoutAuth(SigninApp)} />
        <Route path="todo" component={withAuth(TodoApp)} />
        <Route path="todo-remote" component={withAuth(RemoteTodoApp)} />
        <Route path="todo-pubsub" component={withAuth(PubSubTodoApp)} />
        <Route path="*" component={NotFound} />
      </Route>
    </Router>
  </ApolloProvider>,
  document.getElementById('root')
)

import { fromJS } from 'immutable'
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
import TodoApp from './containers/Todo/TodoApp'
import RemoteTodoApp from './containers/RemoteTodo/RemoteTodoApp'
import PubSubTodoApp from './containers/PubSubTodo/PubSubTodoApp'
import configureStore from './redux/store'
import createApolloClient from './apollo/create-apollo-client'
import getNetworkInterface from './apollo/transport'
import config from '../config'
import './index.css'

const initialState = {
  todo: fromJS({
    todos: [
      {id: '0', text: 'hello', completed: true},
      {id: '1', text: 'world', completed: false}
    ]
  })
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
  predicate: auth => !!auth.get('username'),
  redirectAction: replace,
  allowRedirectBack: true,
  failureRedirectPath: '/signin',
  wrapperDisplayName: 'withAuth'
})

const withoutAuth = UserAuthWrapper({
  authSelector: state => state.auth,
  predicate: auth => !auth.get('username'),
  redirectAction: replace,
  allowRedirectBack: false,
  failureRedirectPath: (state, ownProps) => {
    return ownProps.location.query.redirect || '/'
  },
  wrapperDisplayName: 'withoutAuth'
})

ReactDOM.render(
  <ApolloProvider store={store} client={apolloClient}>
    <Router history={history}>
      <Route path="/" component={App}>
        <IndexRoute component={HomeApp}/>
        <Route path="todo" component={TodoApp}/>
        <Route path="todo-remote" component={RemoteTodoApp}/>
        <Route path="todo-pubsub" component={PubSubTodoApp}/>
      </Route>
    </Router>
  </ApolloProvider>,
  document.getElementById('root')
)
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  createHttpLink,
  from,
  InMemoryCache,
} from '@apollo/client';
import { getAccessToken, setAccessToken } from './accessToken';
import App from './App';
import jwtDecode from 'jwt-decode';
import { TokenRefreshLink } from 'apollo-link-token-refresh';

const httpLink = createHttpLink({
  credentials: 'include',
  uri: 'http://localhost:4000/graphql',
});

const authMiddleware = new ApolloLink((operation, forward) => {
  console.log('authMiddleware runs!');
  // add the authorization to the headers
  operation.setContext(({ headers = {} }) => {
    const token = getAccessToken();
    return {
      headers: {
        ...headers,
        authorization: token ? `bearer ${token}` : '',
      },
    };
  });

  return forward(operation);
});

const refreshTokenMiddleware = new TokenRefreshLink({
  accessTokenField: 'accessToken',

  isTokenValidOrUndefined: () => {
    console.log('refreshTokenMiddleware runs!');
    const token = getAccessToken();

    if (!token) {
      return false;
    }

    try {
      // Decode token to get expiration
      const { exp } = jwtDecode(token) as any;
      if (Date.now() >= exp * 1000) {
        return false;
      } else {
        return true;
      }
    } catch {
      return false;
    }
  },

  fetchAccessToken: () => {
    return fetch('http://localhost:4000/refresh_token', {
      method: 'POST',
      credentials: 'include',
    });
  },
  handleFetch: (accessToken) => {
    console.log('Middleware token: ', accessToken);
    setAccessToken(accessToken);
  },
  handleError: (err) => {
    console.warn('Your refresh token is invalid. Try to relogin');
    console.log(err);
  },
});

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  // creadentials: 'include' will let us save cookies
  credentials: 'include',
  link: from([refreshTokenMiddleware, authMiddleware, httpLink]),
  cache: new InMemoryCache(),
});

ReactDOM.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

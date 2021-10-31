import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { setAccessToken } from 'src/accessToken';
import { MeDocument, MeQuery, useLoginMutation } from 'src/generated/graphql';

interface LoginProps {}

const Login: React.FC<LoginProps & RouteComponentProps> = ({ history }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login] = useLoginMutation();

  return (
    <div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const response = await login({
            variables: {
              email,
              password,
            },
            // We get access to store and data from the response
            update: (store, { data }) => {
              if (!data) {
                return null;
              }
              // We update the cache, what we got from Me query!
              // When we update is like that, it's important we get pass the same fields
              // into data, as we got from running this Me query
              // Best way to figure out what we should pass, it to pass a type into this,
              // actual MeQuery type!
              store.writeQuery<MeQuery>({
                query: MeDocument,
                data: {
                  __typename: 'Query',
                  me: data.login.user,
                },
              });
              return;
            },
          });

          if (response && response.data) {
            setAccessToken(response.data.login.accessToken);
          }

          history.push('/');
        }}
      >
        <div>
          <input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type='submit'>Login</button>
      </form>
    </div>
  );
};

export default Login;

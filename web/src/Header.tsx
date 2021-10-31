import React from 'react';
import { Link } from 'react-router-dom';
import { setAccessToken } from './accessToken';
import { useLogoutMutation, useMeQuery } from './generated/graphql';

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  const { data, loading } = useMeQuery();
  const [logout, { client }] = useLogoutMutation();

  let body: any = null;

  if (loading) {
    body = null;
  } else if (data && data.me) {
    body = <div>you are logged in as: {data.me.email}</div>;
  } else {
    body = <div>Not logged in.</div>;
  }

  return (
    <div>
      <header>
        <div>
          <Link to='/'>Home</Link>
        </div>
        <div>
          <Link to='/register'>Register</Link>
        </div>
        <div>
          <Link to='/login'>Login</Link>
        </div>
        <div>
          {!loading && data && data.me ? (
            <button
              onClick={async () => {
                await logout();
                setAccessToken('');

                // doesn't work, error and doesn't update
                client.resetStore();
              }}
            >
              Logout
            </button>
          ) : null}
        </div>
        <div>
          <Link to='/bye'>Bye</Link>
        </div>
        {body}
        <br />
      </header>
    </div>
  );
};

export default Header;

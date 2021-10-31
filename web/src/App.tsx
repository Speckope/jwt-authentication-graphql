import React, { useEffect, useState } from 'react';
import { setAccessToken } from './accessToken';
import Routes from './Routes';

interface AppProps {}

const App: React.FC<AppProps> = ({}) => {
  const [loading, setLoading] = useState(true);

  // We run this at the begining, once, to get a refresh token
  // This is so when user refreshes, he gets a token!
  // Since we are storing accessToken in a environmental variable, it
  // gets deleted everytime user refreshes.

  // We are sending our refreshToken (one that is stored in a cookie)
  // to get a new accessToken!
  useEffect(() => {
    fetch('http://localhost:4000/refresh_token', {
      method: 'POST',
      // With credentials we can send a cookie
      credentials: 'include',
      // This is how we get data back from fetch
    }).then(async (x) => {
      const { accessToken } = await x.json();
      setAccessToken(accessToken);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div>loading...</div>;
  }

  return <Routes />;
};

export default App;

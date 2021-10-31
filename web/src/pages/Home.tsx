import React from 'react';
import { useUsersQuery } from 'src/generated/graphql';

interface HomeProps {}

const Home: React.FC<HomeProps> = ({}) => {
  const { data } = useUsersQuery({
    // this means it's not gonna read from the cache, but make a request every time
    fetchPolicy: 'network-only',
  });

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div>users:</div>
      <ul>
        {data.user.map((user) => (
          <li key={user.id}>
            {user.email}, {user.id}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;

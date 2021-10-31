import React from 'react';
import { useByeQuery } from 'src/generated/graphql';

interface ByeProps {}

const Bye: React.FC<ByeProps> = ({}) => {
  const { data, error, loading } = useByeQuery({
    nextFetchPolicy: 'network-only',
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    console.log(error);
    return <div>{error.message}</div>;
  }

  if (!data) {
    return <div>no data</div>;
  }

  return <div>{data?.bye}</div>;
};

export default Bye;

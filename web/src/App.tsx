import { useHelloQuery } from './generated/graphql';

function App() {
  // const { data, loading } = useQuery(gql`
  //   {
  //     hello
  //   }
  // `);

  const { data, loading } = useHelloQuery();

  if (loading || !data) {
    return <div>loading...</div>;
  }

  return <div className='App'>{JSON.stringify(data.hello)}</div>;
}

export default App;

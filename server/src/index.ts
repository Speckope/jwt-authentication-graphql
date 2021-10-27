import 'dotenv/config';
import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { buildSchema } from 'type-graphql';
import { UserResolver } from './UserResolver';
import { createConnection } from 'typeorm';

(async () => {
  const app = express();

  app.get('/', (_, res) => {
    res.send('Hello!');
  });

  // We don't have to pass anything, bc everything is in our ormconfig.json
  await createConnection();

  const apolloServer = new ApolloServer({
    // buildSchema is from type-graphql and it build type-defs and resolvers
    schema: await buildSchema({
      // pass an array of resolvers
      resolvers: [UserResolver],
    }),
    context: ({ req, res }) => ({ req, res }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({
    app,
  });

  app.listen(4000, () => console.log('Express listening on 4000...'));
})();

// createConnection()
//   .then(async (connection) => {
//     console.log('Inserting a new user into the database...');
//     const user = new User();
//     user.firstName = 'Timber';
//     user.lastName = 'Saw';
//     user.age = 25;
//     await connection.manager.save(user);
//     console.log('Saved a new user with id: ' + user.id);

//     console.log('Loading users from the database...');
//     const users = await connection.manager.find(User);
//     console.log('Loaded users: ', users);

//     console.log('Here you can setup and run express/koa/any other framework.');
//   })
//   .catch((error) => console.log(error));

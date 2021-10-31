import 'dotenv/config';
import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { buildSchema } from 'type-graphql';
import { UserResolver } from './UserResolver';
import { createConnection } from 'typeorm';
import cors from 'cors';
// This is express middleware to parse cookies
import cookieParser from 'cookie-parser';
import { verify } from 'jsonwebtoken';
import { User } from './entity/User';
import { createAccessToken, createRefreshToken } from './auth';
import { sendRefreshToken } from './sendRefreshToken';

(async () => {
  const app = express();
  // Cors handling middleware
  app.use(
    cors({
      // With this we can send cookies
      credentials: true,
      // Origin is what is requesting (our frontend website)
      origin: 'http://localhost:3000',
    })
  );
  // With this we can do req.cookies and recieve object like this: { jid: 'abcd123' }
  app.use(cookieParser());

  app.get('/', (_, res) => {
    res.send('Hello!');
  });

  // This is a special route, it will help with refresh purposes
  app.post('/refresh_token', async (req, res) => {
    // Read token from our cookie
    const token = req.cookies.jid;
    // return if no token
    if (!token) {
      // We don't send an access token and say ok false
      return res.send({ ok: false, accessToken: '' });
    }

    let payload: any = null;
    try {
      // Make sure refresh token has not expired and it's valid
      payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
    } catch (err) {
      console.log(err);
      return res.send({ ok: false, accessToken: '' });
    }

    // If get here, means token is valid and we can send back an access token
    // Find user with our userId from token
    const user = await User.findOne({ id: payload.userId });

    // If no user
    if (!user) {
      return res.send({ ok: false, accessToken: '' });
    }

    // If versions doesn't match, it means the token is invalid
    if (user.tokenVersion !== payload.tokenVersion) {
      return res.send({ ok: false, accessToken: '' });
    }

    // Send a new refresh token
    sendRefreshToken(res, createRefreshToken(user));

    // Send back ok true and new access token if we have found a user from recieved token
    return res.send({ ok: true, accessToken: createAccessToken(user) });
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
    // We won't be using apollo cors handling,
    // presumably easier to do it ourselves
    cors: false,
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

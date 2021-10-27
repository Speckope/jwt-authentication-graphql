import { MiddlewareFn } from 'type-graphql';
import { MyContext } from './MyContext';
import { verify } from 'jsonwebtoken';

// User should send token in a format
// bearer fsdf09sdf8f

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
  const authorization = context.req.headers['authorization'];

  // If there is no authorization header
  if (!authorization) throw new Error('not authenticated');

  try {
    const token = authorization?.split(' ')[1];

    // We expect accessToken
    // verify throws an error if it's invalid or expired
    const payload = verify(token, process.env.ACCESS_TOKEN_SECRET!);
    // We pass payload to context and we have access to user.id !!
    context.payload = payload as any;
  } catch (err) {
    console.log(err);
    throw new Error('not authenticated');
  }

  // next() tells we're done with the current resolver
  // We can have as many middlewares before a resolver as we want
  return next();
};

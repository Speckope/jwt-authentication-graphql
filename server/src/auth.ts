import { sign } from 'jsonwebtoken';
import { User } from './entity/User';

// We pass into sign what we want to store in a token as a first argument
// 2nd is a secret to validate the token
// 3rd is options
export const createAccessToken = (user: User) => {
  /// accessToken should be for something short
  return sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: '15m',
  });
};

export const createRefreshToken = (user: User) => {
  return sign(
    // Pass token version, when refreshing we will check if it matches
    // one saved in user.
    { userId: user.id, tokenVersion: user.tokenVersion },
    process.env.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: '7d',
    }
  );
};

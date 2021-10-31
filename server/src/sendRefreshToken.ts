import { Response } from 'express';

// Now we have logic for sending refreshToken encapsulated, so when we
// change it it will change in all places.
export const sendRefreshToken = (res: Response, token: string) => {
  res.cookie('jid', token, {
    httpOnly: true,
    // This will restrict refreshing token to this route(when we send request to this route)
    path: '/refresh_token',
  });
};

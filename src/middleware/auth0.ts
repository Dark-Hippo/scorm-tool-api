import { auth } from 'express-oauth2-jwt-bearer';

export const validateAccessToken = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_BASE_URL,
  tokenSigningAlg: 'RS256',
});

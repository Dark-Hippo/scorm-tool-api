import { auth } from 'express-oauth2-jwt-bearer';

export const validateAccessToken = auth({
  audience: process.env.AUTH_AUDIENCE,
  issuerBaseURL: process.env.AUTH_BASE_URL,
});

import { User } from '@prisma/client';
import { logError } from './logger';

export const createUser = async (user: User): Promise<void> => {
  try {
    const auth0BaseUrl = process.env.AUTH0_BASE_URL;
    const auth0ApiToken = process.env.AUTH0_MANAGEMENT_API_TOKEN;

    if (!auth0BaseUrl) throw new Error('AUTH0_BASE_URL is not defined');
    if (!auth0ApiToken)
      throw new Error('AUTH0_MANAGEMENT_API_TOKEN is not defined');

    const body = JSON.stringify({
      email: user.email,
      name: user.name,
      connection: 'Username-Password-Authentication',
      password: 'Sy!CTt6V$)Ga&h:M',
      email_verified: false,
      user_id: user.id.toString(),
    });

    const response = await fetch(`${auth0BaseUrl}api/v2/users`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${auth0ApiToken}`,
        'Content-Type': 'application/json',
      },
      body: body,
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(`Failed to create user: ${errorBody.message}`);
    }

    const data = await response.json();

    console.log(`Created user with id: ${data.user_id}`);
  } catch (error) {
    if (error instanceof TypeError) {
      logError(`Network error: ${error.message}`);
    } else if (error instanceof SyntaxError) {
      logError(`Invalid response body: ${error.message}`);
    } else {
      logError(error);
    }
  }
};
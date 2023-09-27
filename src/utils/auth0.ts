import { User } from '@prisma/client';
import { log, logError } from './logger';
import { generate } from 'generate-password';

export const createUser = async (user: User): Promise<string> => {
  try {
    const auth0BaseUrl = process.env.AUTH0_BASE_URL;
    const auth0ApiToken = process.env.AUTH0_MANAGEMENT_API_TOKEN;

    if (!auth0BaseUrl) throw new Error('AUTH0_BASE_URL is not defined');
    if (!auth0ApiToken)
      throw new Error('AUTH0_MANAGEMENT_API_TOKEN is not defined');

    const password = generate({
      length: 10,
      numbers: true,
      symbols: true,
      uppercase: true,
      lowercase: true,
      excludeSimilarCharacters: true,
      exclude: '()+_-=}{[]|:;"/?.><,`~\'-_\\',
      strict: true,
    });

    const body = JSON.stringify({
      email: user.email,
      name: user.name,
      connection: 'Username-Password-Authentication',
      password: password,
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

    log(`Created user with id: ${data.user_id}`);

    return data.user_id;
  } catch (error) {
    if (error instanceof TypeError) {
      logError(`Network error: ${error.message}`);
    } else if (error instanceof SyntaxError) {
      logError(`Invalid response body: ${error.message}`);
    } else {
      logError(error);
    }
    throw error;
  }
};

export const updateUser = async (user: User): Promise<void> => {
  try {
    const auth0BaseUrl = process.env.AUTH0_BASE_URL;
    const auth0ApiToken = process.env.AUTH0_MANAGEMENT_API_TOKEN;

    if (!auth0BaseUrl) throw new Error('AUTH0_BASE_URL is not defined');
    if (!auth0ApiToken)
      throw new Error('AUTH0_MANAGEMENT_API_TOKEN is not defined');

    const body = JSON.stringify({
      email: user.email,
      name: user.name,
    });

    const response = await fetch(
      `${auth0BaseUrl}api/v2/users/${user.auth0Id}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${auth0ApiToken}`,
          'Content-Type': 'application/json',
        },
        body: body,
      }
    );

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(`Failed to update user: ${errorBody.message}`);
    }

    log(`Updated user with id: ${user.id}`);
  } catch (error) {
    if (error instanceof TypeError) {
      logError(`Network error: ${error.message}`);
    } else if (error instanceof SyntaxError) {
      logError(`Invalid response body: ${error.message}`);
    } else {
      logError(error);
    }
    throw error;
  }
};

/**
 * Blocks a user in Auth0
 * @param userId auth0Id of the user to block
 */
export const blockUser = async (user: User): Promise<void> => {
  try {
    if (!user.auth0Id) throw new Error('auth0Id is not set');

    const auth0BaseUrl = process.env.AUTH0_BASE_URL;
    const auth0ApiToken = process.env.AUTH0_MANAGEMENT_API_TOKEN;

    if (!auth0BaseUrl) throw new Error('AUTH0_BASE_URL is not defined');
    if (!auth0ApiToken)
      throw new Error('AUTH0_MANAGEMENT_API_TOKEN is not defined');

    const response = await fetch(
      `${auth0BaseUrl}api/v2/users/${user.auth0Id}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${auth0ApiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blocked: true }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(`Failed to block user: ${errorBody.message}`);
    }

    log(`Blocked user with id: ${user.id}`);
  } catch (error) {
    if (error instanceof TypeError) {
      logError(`Network error: ${error.message}`);
    } else if (error instanceof SyntaxError) {
      logError(`Invalid response body: ${error.message}`);
    } else {
      logError(error);
    }
    throw error;
  }
};

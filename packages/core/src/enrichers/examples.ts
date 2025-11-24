/**
 * Examples enricher - Adds request body examples and response examples
 */

import type {
  PostmanCollection,
  PostmanResponse,
  ExampleConfig,
} from '@openapi-to-postman-complete/shared';
import {
  walkCollection,
  isRequest,
  getRequestMethod,
} from '@openapi-to-postman-complete/shared';

/**
 * Add examples to requests and responses
 * @param collection - Postman collection
 * @param config - Examples configuration
 * @returns Collection with examples
 */
export function addExamples(
  collection: PostmanCollection,
  config: ExampleConfig | undefined
): PostmanCollection {
  if (!config) return collection;

  walkCollection(collection.item, (item) => {
    if (!isRequest(item) || !item.request) return;

    const requestName = item.name;
    const method = getRequestMethod(item);

    // Add request body examples
    if (item.request?.body?.raw && config.requests?.[requestName]?.body) {
      try {
        const body = JSON.parse(item.request.body.raw);
        const exampleBody = { ...body, ...config.requests[requestName].body };
        item.request.body.raw = JSON.stringify(exampleBody, null, 2);
      } catch {
        // Not JSON, skip
      }
    }

    // Add response examples
    if (config.responses?.[requestName]) {
      const responseExample = config.responses[requestName];
      item.response = [
        {
          name: responseExample.name || 'Success',
          status: responseExample.status || getDefaultStatus(method),
          code: responseExample.code || getDefaultStatusCode(method),
          _postman_previewlanguage: 'json',
          header: [{ key: 'Content-Type', value: 'application/json' }],
          body: JSON.stringify(responseExample.body, null, 2),
        },
      ];
    } else if (!item.response || item.response.length === 0) {
      // Add default response example if none exists
      item.response = [getDefaultResponseExample(method)];
    }
  });

  return collection;
}

/**
 * Get default status text for HTTP method
 * @param method - HTTP method
 * @returns Status text
 */
function getDefaultStatus(method: string): string {
  const statuses: Record<string, string> = {
    GET: 'OK',
    POST: 'Created',
    PUT: 'OK',
    PATCH: 'OK',
    DELETE: 'No Content',
  };
  return statuses[method] || 'OK';
}

/**
 * Get default status code for HTTP method
 * @param method - HTTP method
 * @returns Status code
 */
function getDefaultStatusCode(method: string): number {
  const codes: Record<string, number> = {
    GET: 200,
    POST: 201,
    PUT: 200,
    PATCH: 200,
    DELETE: 204,
  };
  return codes[method] || 200;
}

/**
 * Get default response example for HTTP method
 * @param method - HTTP method
 * @returns Response example
 */
function getDefaultResponseExample(method: string): PostmanResponse {
  if (method === 'DELETE') {
    return {
      name: 'No Content',
      status: 'No Content',
      code: 204,
      header: [],
      body: '',
    };
  }

  if (method === 'POST') {
    return {
      name: 'Created',
      status: 'Created',
      code: 201,
      _postman_previewlanguage: 'json',
      header: [{ key: 'Content-Type', value: 'application/json' }],
      body: JSON.stringify(
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          message: 'Resource created successfully',
        },
        null,
        2
      ),
    };
  }

  return {
    name: 'Success',
    status: 'OK',
    code: 200,
    _postman_previewlanguage: 'json',
    header: [{ key: 'Content-Type', value: 'application/json' }],
    body: JSON.stringify(
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Example Resource',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      null,
      2
    ),
  };
}

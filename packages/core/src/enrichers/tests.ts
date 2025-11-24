/**
 * Tests enricher - Adds basic test scripts to requests
 */

import type {
  PostmanCollection,
  TestConfig,
} from '@openapi-to-postman-complete/shared';
import {
  walkCollection,
  isRequest,
  getRequestMethod,
} from '@openapi-to-postman-complete/shared';

/**
 * Add test scripts to requests
 * @param collection - Postman collection
 * @param config - Tests configuration
 * @returns Collection with test scripts
 */
export function addTests(
  collection: PostmanCollection,
  config: TestConfig | undefined
): PostmanCollection {
  if (!config?.auto) return collection;

  walkCollection(collection.item, (item) => {
    if (!isRequest(item)) return;

    const method = getRequestMethod(item);
    const testScript = getTestTemplate(method);

    if (testScript) {
      item.event = item.event || [];
      item.event.push({
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: testScript,
        },
      });
    }
  });

  return collection;
}

/**
 * Get test template for HTTP method
 * @param method - HTTP method
 * @returns Test script lines or null
 */
function getTestTemplate(method: string): string[] | null {
  const templates: Record<string, string[]> = {
    GET: [
      'pm.test("Status code is 200", () => {',
      '    pm.response.to.have.status(200);',
      '});',
      '',
      'pm.test("Response time is less than 1000ms", () => {',
      '    pm.expect(pm.response.responseTime).to.be.below(1000);',
      '});',
    ],
    POST: [
      'pm.test("Successful creation", () => {',
      '    pm.expect(pm.response.code).to.be.oneOf([200, 201]);',
      '});',
      '',
      'pm.test("Response has data", () => {',
      '    const jsonData = pm.response.json();',
      '    pm.expect(jsonData).to.be.an("object");',
      '});',
    ],
    PUT: [
      'pm.test("Successful update", () => {',
      '    pm.expect(pm.response.code).to.be.oneOf([200, 204]);',
      '});',
    ],
    PATCH: [
      'pm.test("Successful partial update", () => {',
      '    pm.expect(pm.response.code).to.be.oneOf([200, 204]);',
      '});',
      '',
      'pm.test("Response has updated data", () => {',
      '    if (pm.response.code === 200) {',
      '        const jsonData = pm.response.json();',
      '        pm.expect(jsonData).to.be.an("object");',
      '    }',
      '});',
    ],
    DELETE: [
      'pm.test("Successful deletion", () => {',
      '    pm.response.to.have.status(204);',
      '});',
    ],
  };

  return templates[method] || null;
}

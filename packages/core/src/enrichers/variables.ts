/**
 * Variables enricher - Sets up path variables and environment variables
 */

import type {
  PostmanCollection,
  VariableConfig,
  PostmanQueryParam,
} from '@openapi-to-postman-complete/shared';
import { walkCollection, isRequest } from '@openapi-to-postman-complete/shared';

/**
 * Setup variables in the collection
 * @param collection - Postman collection
 * @param config - Variables configuration
 * @returns Collection with variables configured
 */
export function setupVariables(
  collection: PostmanCollection,
  config: VariableConfig | undefined
): PostmanCollection {
  if (!config) return collection;

  // 1. Clear collection variables (use environment variables instead)
  collection.variable = [];

  // 2. Setup path variables
  if (config.path) {
    walkCollection(collection.item, (item) => {
      if (!isRequest(item) || !item.request?.url) return;

      const url = item.request.url;
      if (!url.path || !Array.isArray(url.path)) return;

      // Initialize variable array if needed
      if (!url.variable) {
        url.variable = [];
      }

      // Check which path variables are needed
      Object.entries(config.path!).forEach(([varName, varValue]) => {
        if (
          url.path &&
          Array.isArray(url.path) &&
          url.path.includes(`:${varName}`)
        ) {
          // Find existing variable or add new one
          const existingIndex = url.variable!.findIndex(
            (v) => v.key === varName
          );

          const variable = {
            key: varName,
            value: varValue,
            description: config.descriptions?.[varName] || '',
          };

          if (existingIndex >= 0) {
            url.variable![existingIndex] = variable;
          } else {
            url.variable!.push(variable);
          }
        }
      });
    });
  }

  // 3. Update host URLs to use environment variables
  const baseUrlVar = config.baseUrlVar || 'baseUrl';
  walkCollection(collection.item, (item) => {
    if (isRequest(item) && item.request?.url) {
      item.request.url.host = [`{{${baseUrlVar}}}`];
    }
  });

  // 4. Process query parameters
  if (config.query) {
    walkCollection(collection.item, (item) => {
      if (!isRequest(item) || !item.request?.url?.query) return;

      Object.entries(config.query!).forEach(([key, value]) => {
        const query = item.request!.url.query!;
        const paramIndex = query.findIndex((q) => q.key === key);
        if (paramIndex >= 0) {
          const existingParam = query[paramIndex];
          query[paramIndex] = {
            key,
            value,
            disabled: false,
            ...(existingParam.description && {
              description: existingParam.description,
            }),
          } as PostmanQueryParam;
        }
      });
    });
  }

  // 5. Add collection-level pre-request script for environment validation
  const envVars = config.environment ? Object.keys(config.environment) : [];
  if (envVars.length > 0) {
    const script = [
      '// Validate required environment variables',
      ...envVars.map(
        (varName) => `if (!pm.environment.get("${varName}")) {
    console.warn("Please set your ${varName} in the environment");
}`
      ),
      '',
      '// Save timestamp for chaining requests',
      'pm.globals.set("timestamp", new Date().toISOString());',
    ];

    collection.event = collection.event || [];
    collection.event.push({
      listen: 'prerequest',
      script: {
        type: 'text/javascript',
        exec: script,
      },
    });
  }

  return collection;
}

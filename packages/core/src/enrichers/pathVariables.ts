/**
 * Path Variables enricher - Ensures path parameters reference collection/environment variables
 */

import type {
  PostmanCollection,
  PathVariablesConfig,
} from '@postman-enricher/shared';
import { walkCollection, isRequest } from '@postman-enricher/shared';

export function setupPathVariables(
  collection: PostmanCollection,
  config: PathVariablesConfig
): PostmanCollection {
  if (!config?.enabled) {
    return collection;
  }

  walkCollection(collection.item, (item) => {
    if (!isRequest(item) || !item.request?.url) return;

    const url = item.request.url;
    if (typeof url === 'string' || !url.variable) return;

    // Update path variables with mappings
    url.variable = url.variable.map((variable) => {
      const mapping = config.mapping?.[variable.key];
      if (mapping) {
        return {
          ...variable,
          value: mapping.reference,
          description: mapping.description || variable.description,
        };
      }
      return variable;
    });
  });

  return collection;
}

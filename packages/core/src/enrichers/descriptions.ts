/**
 * Descriptions enricher - Adds rich markdown descriptions to collection, folders, and requests
 */

import type {
  PostmanCollection,
  DescriptionConfig,
} from '@postman-enricher/shared';
import {
  walkCollection,
  isFolder,
  isRequest,
  getRequestMethod,
} from '@postman-enricher/shared';

/**
 * Add descriptions to collection, folders, and requests
 * @param collection - Postman collection
 * @param config - Descriptions configuration
 * @returns Collection with descriptions
 */
export function addDescriptions(
  collection: PostmanCollection,
  config: DescriptionConfig | undefined
): PostmanCollection {
  if (!config) return collection;

  // 1. Update collection-level info
  if (config.collection) {
    const collectionKey = Object.keys(config.collection).find((key) =>
      collection.info.name.toLowerCase().includes(key.toLowerCase())
    );

    if (collectionKey) {
      const collectionConfig = config.collection[collectionKey];
      if (collectionConfig.name) {
        collection.info.name = collectionConfig.name;
      }
      if (collectionConfig.description) {
        collection.info.description = {
          content: collectionConfig.description,
          type: 'text/markdown',
        };
      }
    }
  }

  // 2. Add folder descriptions
  if (config.folders) {
    walkCollection(collection.item, (item) => {
      if (isFolder(item)) {
        const folderKey = item.name?.toLowerCase();

        // Try exact match first
        if (config.folders && config.folders[folderKey]) {
          item.description = config.folders[folderKey];
        }
        // Try without special characters
        else {
          const cleanKey = folderKey?.replace(/[{}:]/g, '');
          if (config.folders && cleanKey && config.folders[cleanKey]) {
            item.description = config.folders[cleanKey];
          }
        }
      }
    });
  }

  // 3. Add request descriptions
  if (config.requests) {
    walkCollection(collection.item, (item) => {
      if (isRequest(item) && item.request) {
        const requestName = item.name;

        if (config.requests && config.requests[requestName]) {
          item.request.description = config.requests[requestName];
        } else {
          // Generate generic description if not specified
          item.request.description = generateGenericDescription(
            getRequestMethod(item),
            requestName
          );
        }
      }
    });
  }

  return collection;
}

/**
 * Generate a description based on HTTP method and name
 * @param method - HTTP method
 * @param name - Request name
 * @returns Generated description
 */
function generateGenericDescription(method: string, name: string): string {
  const descriptions: Record<string, string> = {
    GET: `Retrieve ${name
      .toLowerCase()
      .replace(/^get\s+/, '')
      .replace(/^list\s+/, '')}`,
    POST: `Create new ${name
      .toLowerCase()
      .replace(/^create\s+/, '')
      .replace(/^add\s+/, '')}`,
    PUT: `Update ${name.toLowerCase().replace(/^update\s+/, '')}`,
    PATCH: `Partially update ${name.toLowerCase().replace(/^update\s+/, '')}`,
    DELETE: `Delete ${name
      .toLowerCase()
      .replace(/^delete\s+/, '')
      .replace(/^remove\s+/, '')}`,
  };

  return (
    descriptions[method] ||
    `Perform ${method} operation on ${name.toLowerCase()}`
  );
}

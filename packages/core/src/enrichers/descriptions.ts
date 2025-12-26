/**
 * Descriptions enricher - Adds rich markdown descriptions to collection, folders, and requests
 */

import type {
  PostmanCollection,
  DescriptionConfig,
} from '@postman-enricher/shared';
import { walkCollection, isFolder, isRequest } from '@postman-enricher/shared';

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
        let descriptionText: string | undefined;

        // Try exact match first
        if (config.folders && config.folders[folderKey]) {
          descriptionText = config.folders[folderKey];
        }
        // Try without special characters
        else {
          const cleanKey = folderKey?.replace(/[{}:]/g, '');
          if (config.folders && cleanKey && config.folders[cleanKey]) {
            descriptionText = config.folders[cleanKey];
          }
        }

        if (descriptionText) {
          item.description = {
            content: descriptionText,
            type: 'text/markdown',
          };
        }
      }
    });
  }

  // 3. Add request descriptions (always run to fill empty descriptions)
  walkCollection(collection.item, (item) => {
    if (isRequest(item) && item.request) {
      const requestName = item.name;
      const existingDesc = item.request.description;
      const existingContent =
        typeof existingDesc === 'object' ? existingDesc?.content : existingDesc;

      // Check if config has a custom description for this request
      if (config?.requests && config.requests[requestName]) {
        item.request.description = {
          content: config.requests[requestName],
          type: 'text/markdown',
        };
      }
      // Fill empty descriptions with the request name (which is usually descriptive from OpenAPI summary)
      else if (!existingContent || existingContent.trim() === '') {
        item.request.description = {
          content: requestName,
          type: 'text/markdown',
        };
      }
      // Convert existing string descriptions to object format
      else if (typeof existingDesc === 'string') {
        item.request.description = {
          content: existingDesc,
          type: 'text/markdown',
        };
      }
    }
  });

  return collection;
}

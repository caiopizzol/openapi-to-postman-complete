/**
 * Filter enricher - Removes non-essential endpoints from collection
 */

import type {
  PostmanCollection,
  PostmanItem,
  FilterConfig,
} from '@postman-enricher/shared';
import {
  isRequest,
  getRequestMethod,
  getUrlPath,
  shouldIncludeEndpoint,
} from '@postman-enricher/shared';

/**
 * Filter collection to only include specified endpoints
 * @param collection - Postman collection
 * @param config - Filter configuration with include/exclude endpoints
 * @returns Filtered collection
 */
export function filterEndpoints(
  collection: PostmanCollection,
  config: FilterConfig
): PostmanCollection {
  if (!config?.include) {
    return collection; // No filtering configured
  }

  function filterItems(items: PostmanItem[] | undefined): PostmanItem[] {
    if (!items) return [];

    return items
      .map((item) => {
        if (isRequest(item)) {
          // This is a request item
          const method = getRequestMethod(item);
          const path = getUrlPath(item.request!.url);

          if (
            shouldIncludeEndpoint(
              method,
              path,
              config.include!,
              config.normalizationRules || {}
            )
          ) {
            return item;
          }
          return null; // Filter out this endpoint
        } else if (item.item) {
          // This is a folder
          const filteredSubItems = filterItems(item.item).filter(Boolean);
          if (filteredSubItems.length > 0) {
            return {
              ...item,
              item: filteredSubItems,
            };
          }
          return null; // Remove empty folders
        }
        return item;
      })
      .filter((item): item is PostmanItem => item !== null);
  }

  const filtered: PostmanCollection = {
    ...collection,
    item: filterItems(collection.item),
  };

  // Add note about filtering in description (if provided in config)
  if (filtered.info && config.note) {
    filtered.info.description =
      (filtered.info.description || '') + '\n\n' + config.note;
  }

  return filtered;
}

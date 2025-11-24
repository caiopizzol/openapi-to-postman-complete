/**
 * Collection traversal utilities
 * Provides a single, reusable way to walk through Postman collection items
 */

import type { PostmanItem, PostmanUrl } from './types.js';

/**
 * Walk through all items in a collection recursively
 * @param items - Collection items (requests and folders)
 * @param handler - Function called for each item
 */
export function walkCollection(
  items: PostmanItem[] | undefined,
  handler: (item: PostmanItem) => void
): void {
  if (!items || !Array.isArray(items)) return;

  items.forEach((item) => {
    // Call handler for this item
    handler(item);

    // Recurse into nested items (folders)
    if (item.item && Array.isArray(item.item)) {
      walkCollection(item.item, handler);
    }
  });
}

/**
 * Check if an item is a request (not a folder)
 * @param item - Collection item
 * @returns True if item is a request
 */
export function isRequest(item: PostmanItem): boolean {
  return !!item.request;
}

/**
 * Check if an item is a folder
 * @param item - Collection item
 * @returns True if item is a folder
 */
export function isFolder(item: PostmanItem): boolean {
  return !!item.item && !item.request;
}

/**
 * Get the HTTP method from a request item
 * @param item - Request item
 * @returns HTTP method (GET, POST, etc.)
 */
export function getRequestMethod(item: PostmanItem): string {
  return item.request?.method || 'GET';
}

/**
 * Extract the path from a Postman URL object
 * @param url - Postman URL object or string
 * @returns Path portion of the URL
 */
export function getUrlPath(url: PostmanUrl | string): string {
  if (typeof url === 'string') {
    return url;
  }

  if (url?.path) {
    if (Array.isArray(url.path)) {
      return '/' + url.path.join('/');
    }
    if (typeof url.path === 'string') {
      return url.path;
    }
  }

  if (url?.raw) {
    return url.raw;
  }

  return '';
}

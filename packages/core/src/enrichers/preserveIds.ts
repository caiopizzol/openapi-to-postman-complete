/**
 * Preservation - Maintains IDs and request bodies across collection regenerations
 */

import type {
  PostmanCollection,
  PostmanItem,
  PostmanResponse,
} from '@postman-enricher/shared';
import {
  walkCollection,
  isRequest,
  getRequestMethod,
} from '@postman-enricher/shared';
import { readFileSync, existsSync } from 'fs';

export function preserveIds(
  collection: PostmanCollection,
  existingPath?: string
): PostmanCollection {
  if (!existingPath || !existsSync(existingPath)) {
    return collection;
  }

  try {
    const existing = JSON.parse(
      readFileSync(existingPath, 'utf8')
    ) as PostmanCollection;
    const idMap = buildIdMap(existing);
    const responseMap = buildResponseMap(existing);
    const requestBodyMap = buildRequestBodyMap(existing);

    // Restore collection ID
    if (existing.info?._postman_id) {
      collection.info._postman_id = existing.info._postman_id;
    }

    // Restore item IDs, response IDs/bodies, and request bodies
    walkCollection(collection.item, (item) => {
      const key = getItemKey(item);
      const existingId = idMap.get(key);
      if (existingId) {
        item.id = existingId;
      }

      // Restore request body
      if (isRequest(item) && item.request?.body) {
        const existingBody = requestBodyMap.get(key);
        if (existingBody) {
          item.request.body.raw = existingBody;
        }
      }

      // Restore responses from existing collection
      if (isRequest(item) && item.response) {
        const existingResponses = responseMap.get(key);
        if (existingResponses) {
          item.response = existingResponses;
        }
      }
    });

    return collection;
  } catch {
    return collection; // Silently fail if existing collection is invalid
  }
}

function buildIdMap(collection: PostmanCollection): Map<string, string> {
  const map = new Map<string, string>();

  walkCollection(collection.item, (item) => {
    if (item.id) {
      const key = getItemKey(item);
      map.set(key, item.id);
    }
  });

  return map;
}

function buildResponseMap(
  collection: PostmanCollection
): Map<string, PostmanResponse[]> {
  const map = new Map<string, PostmanResponse[]>();

  walkCollection(collection.item, (item) => {
    if (isRequest(item) && item.response && item.response.length > 0) {
      const key = getItemKey(item);
      map.set(key, item.response);
    }
  });

  return map;
}

function buildRequestBodyMap(
  collection: PostmanCollection
): Map<string, string> {
  const map = new Map<string, string>();

  walkCollection(collection.item, (item) => {
    if (isRequest(item) && item.request?.body?.raw) {
      const key = getItemKey(item);
      map.set(key, item.request.body.raw);
    }
  });

  return map;
}

function getItemKey(item: PostmanItem): string {
  if (isRequest(item)) {
    const method = getRequestMethod(item);
    return `${method}_${item.name}`;
  }
  return `folder_${item.name}`;
}

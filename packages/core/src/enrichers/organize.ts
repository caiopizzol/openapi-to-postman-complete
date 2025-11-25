/**
 * Organize enricher - Reorganizes collection by REST resource hierarchy
 */

import type {
  PostmanCollection,
  PostmanItem,
  OrganizeConfig,
} from '@postman-enricher/shared';
import { getUrlPath, isRequest } from '@postman-enricher/shared';

export function organizeByResources(
  collection: PostmanCollection,
  config: OrganizeConfig
): PostmanCollection {
  if (!config?.enabled || config.strategy !== 'resources') {
    return collection;
  }

  const excludePathParams = config.excludePathParams ?? true;
  const maxDepth = config.nestingLevel || Infinity;

  // First, flatten all requests from existing structure
  const flatRequests = flattenRequests(collection.item);

  const organized = buildResourceHierarchy(
    flatRequests,
    excludePathParams,
    maxDepth
  );

  return {
    ...collection,
    item: organized.length > 0 ? organized : collection.item,
  };
}

/**
 * Recursively flatten all requests from a potentially nested structure
 */
function flattenRequests(items: PostmanItem[]): PostmanItem[] {
  const requests: PostmanItem[] = [];

  for (const item of items) {
    if (isRequest(item)) {
      requests.push(item);
    } else if (item.item) {
      requests.push(...flattenRequests(item.item));
    }
  }

  return requests;
}

function buildResourceHierarchy(
  items: PostmanItem[],
  excludePathParams: boolean,
  maxDepth: number
): PostmanItem[] {
  const folderMap = new Map<string, PostmanItem>();
  const topLevelFolders = new Set<string>();

  items.forEach((item) => {
    if (!isRequest(item) || !item.request?.url) return;

    const path = getUrlPath(item.request.url);
    const segments = extractSegments(path, excludePathParams).slice(
      0,
      maxDepth
    );

    if (segments.length === 0) return;

    // Create/get folders for the path hierarchy
    let folderPath = '';
    let parentFolder: PostmanItem | null = null;

    segments.forEach((segment, index) => {
      folderPath = folderPath ? `${folderPath}/${segment}` : segment;

      if (!folderMap.has(folderPath)) {
        const folder: PostmanItem = { name: segment, item: [] };
        folderMap.set(folderPath, folder);

        if (parentFolder) {
          parentFolder.item!.push(folder);
        } else {
          // This is a top-level folder
          topLevelFolders.add(folderPath);
        }
      }

      parentFolder = folderMap.get(folderPath)!;

      // Add item to deepest folder
      if (index === segments.length - 1) {
        parentFolder.item!.push(item);
      }
    });
  });

  // Return only top-level folders
  return Array.from(topLevelFolders).map((path) => folderMap.get(path)!);
}

function extractSegments(path: string, excludePathParams: boolean): string[] {
  return path
    .split('/')
    .filter((seg) => seg && !seg.endsWith(':'))
    .filter(
      (seg) =>
        !excludePathParams || (!seg.startsWith(':') && !seg.startsWith('{'))
    );
}

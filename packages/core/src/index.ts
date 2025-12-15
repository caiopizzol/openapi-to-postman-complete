/**
 * OpenAPI to Postman Complete - Core
 * Main API for enriching Postman collections with descriptions, examples, variables, and tests
 */

import { readFileSync } from 'fs';
import { parse as parseYaml } from 'yaml';
import type {
  PostmanCollection,
  EnrichmentConfig,
} from '@postman-enricher/shared';
import { filterEndpoints } from './enrichers/filter.js';
import { addDescriptions } from './enrichers/descriptions.js';
import { addExamples } from './enrichers/examples.js';
import { setupVariables } from './enrichers/variables.js';
import { addTests } from './enrichers/tests.js';
import { organizeByResources } from './enrichers/organize.js';
import { setupPathVariables } from './enrichers/pathVariables.js';
import { preserveIds } from './enrichers/preserveIds.js';
// @ts-expect-error - openapi-to-postmanv2 doesn't have types
import Converter from 'openapi-to-postmanv2';

/**
 * Enrich a Postman collection with additional metadata and functionality
 * @param collection - Postman collection to enrich
 * @param config - Enrichment configuration (object or path to YAML file)
 * @param existingCollectionPath - Optional path to existing collection for ID preservation
 * @returns Enriched Postman collection
 */
export function enrichCollection(
  collection: PostmanCollection,
  config: EnrichmentConfig | string = {},
  existingCollectionPath?: string
): PostmanCollection {
  // Load config from YAML file if string path provided
  const enrichmentConfig =
    typeof config === 'string' ? loadConfigFromYaml(config) : config;

  let enriched = { ...collection };

  // 1. Filter endpoints first (reduce what we're working with)
  if (enrichmentConfig.filter) {
    enriched = filterEndpoints(enriched, enrichmentConfig.filter);
  }

  // 2. Organize by resource hierarchy
  if (enrichmentConfig.organize) {
    enriched = organizeByResources(enriched, enrichmentConfig.organize);
  }

  // 3. Add descriptions (collection, folders, requests)
  if (enrichmentConfig.descriptions) {
    enriched = addDescriptions(enriched, enrichmentConfig.descriptions);
  }

  // 4. Add examples (request bodies and responses)
  if (enrichmentConfig.examples) {
    enriched = addExamples(enriched, enrichmentConfig.examples);
  }

  // 5. Setup variables (path variables, environment variables)
  if (enrichmentConfig.variables) {
    enriched = setupVariables(enriched, enrichmentConfig.variables);
  }

  // 6. Setup path variables
  if (enrichmentConfig.pathVariables) {
    enriched = setupPathVariables(enriched, enrichmentConfig.pathVariables);
  }

  // 7. Add test scripts
  if (enrichmentConfig.tests) {
    enriched = addTests(enriched, enrichmentConfig.tests);
  }

  // 8. Preserve IDs from existing collection (if provided) - run LAST
  // This must run after all enrichers so it can match the final folder structure
  if (existingCollectionPath) {
    enriched = preserveIds(enriched, existingCollectionPath);
  }

  return enriched;
}

/**
 * Convert OpenAPI spec to Postman collection and enrich it
 * @param openApiPath - Path to OpenAPI spec file (YAML or JSON)
 * @param config - Enrichment configuration (object or path to YAML file)
 * @param existingCollectionPath - Optional path to existing collection for ID preservation
 * @returns Promise of enriched Postman collection
 */
export async function convertAndEnrich(
  openApiPath: string,
  config: EnrichmentConfig | string = {},
  existingCollectionPath?: string
): Promise<PostmanCollection> {
  const openApiSpec = readFileSync(openApiPath, 'utf8');

  // Convert OpenAPI to Postman collection
  const baseCollection = await new Promise<PostmanCollection>(
    (resolve, reject) => {
      Converter.convert(
        { type: 'string', data: openApiSpec },
        {},
        (err: Error | null, result: any) => {
          if (err) {
            reject(err);
          } else if (!result.result) {
            reject(new Error(result.reason || 'Conversion failed'));
          } else {
            resolve(result.output[0].data);
          }
        }
      );
    }
  );

  // Enrich the collection
  return enrichCollection(baseCollection, config, existingCollectionPath);
}

/**
 * Load enrichment configuration from a YAML file
 * @param filePath - Path to YAML configuration file
 * @returns Parsed enrichment configuration
 */
export function loadConfigFromYaml(filePath: string): EnrichmentConfig {
  try {
    const yaml = readFileSync(filePath, 'utf8');
    return parseYaml(yaml) as EnrichmentConfig;
  } catch (error) {
    throw new Error(
      `Failed to load config from ${filePath}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Export individual enrichers for advanced usage
 */
export {
  filterEndpoints,
  addDescriptions,
  addExamples,
  setupVariables,
  addTests,
  organizeByResources,
  setupPathVariables,
  preserveIds,
};

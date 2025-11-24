/**
 * OpenAPI to Postman Complete - Core
 * Main API for enriching Postman collections with descriptions, examples, variables, and tests
 */

import { readFileSync } from 'fs';
import { parse as parseYaml } from 'yaml';
import type {
  PostmanCollection,
  EnrichmentConfig,
} from '@openapi-to-postman-complete/shared';
import { filterEndpoints } from './enrichers/filter.js';
import { addDescriptions } from './enrichers/descriptions.js';
import { addExamples } from './enrichers/examples.js';
import { setupVariables } from './enrichers/variables.js';
import { addTests } from './enrichers/tests.js';

/**
 * Enrich a Postman collection with additional metadata and functionality
 * @param collection - Postman collection to enrich
 * @param config - Enrichment configuration (object or path to YAML file)
 * @returns Enriched Postman collection
 */
export function enrichCollection(
  collection: PostmanCollection,
  config: EnrichmentConfig | string = {}
): PostmanCollection {
  // Load config from YAML file if string path provided
  const enrichmentConfig =
    typeof config === 'string' ? loadConfigFromYaml(config) : config;

  let enriched = { ...collection };

  // Apply enrichments in order
  // 1. Filter endpoints first (reduce what we're working with)
  if (enrichmentConfig.filter) {
    enriched = filterEndpoints(enriched, enrichmentConfig.filter);
  }

  // 2. Add descriptions (collection, folders, requests)
  if (enrichmentConfig.descriptions) {
    enriched = addDescriptions(enriched, enrichmentConfig.descriptions);
  }

  // 3. Add examples (request bodies and responses)
  if (enrichmentConfig.examples) {
    enriched = addExamples(enriched, enrichmentConfig.examples);
  }

  // 4. Setup variables (path variables, environment variables)
  if (enrichmentConfig.variables) {
    enriched = setupVariables(enriched, enrichmentConfig.variables);
  }

  // 5. Add test scripts
  if (enrichmentConfig.tests) {
    enriched = addTests(enriched, enrichmentConfig.tests);
  }

  return enriched;
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
};

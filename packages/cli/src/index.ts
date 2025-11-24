#!/usr/bin/env node

/**
 * OpenAPI to Postman Complete CLI
 * Command-line tool for converting OpenAPI specs to production-ready Postman collections
 */

import { readFileSync, writeFileSync } from 'fs';
import { enrichCollection } from '@postman-enricher/core';
import type { PostmanCollection } from '@postman-enricher/shared';
// @ts-expect-error - openapi-to-postmanv2 doesn't have types
import Converter from 'openapi-to-postmanv2';

function showHelp() {
  console.log(`
OpenAPI to Postman Complete - Complete OpenAPI to Postman converter

Usage:
  openapi-to-postman-complete <input> <config.yaml> [options]

Arguments:
  input             OpenAPI spec (*.yaml, *.json) or Postman collection (*.json)
  config.yaml       Enrichment configuration YAML file

Options:
  -o, --output      Output file path (default: enriched-collection.json)
  -h, --help        Show this help message

Examples:
  # From OpenAPI spec
  openapi-to-postman-complete api.yaml config.yaml -o collection.json

  # From existing Postman collection
  openapi-to-postman-complete collection.json config.yaml -o enriched.json

For more information, visit: https://github.com/caiopizzol/openapi-to-postman-complete
  `);
}

async function convertOpenApiToPostman(
  inputPath: string
): Promise<PostmanCollection> {
  const openApiSpec = readFileSync(inputPath, 'utf8');

  return new Promise((resolve, reject) => {
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
  });
}

function isOpenApiFile(path: string): boolean {
  return path.endsWith('.yaml') || path.endsWith('.yml');
}

async function main() {
  const args = process.argv.slice(2);

  // Show help
  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    showHelp();
    process.exit(0);
  }

  // Parse arguments
  const inputPath = args[0];
  const configPath = args[1];
  let outputPath = 'enriched-collection.json';

  // Check for output flag
  const outputIndex = args.findIndex(
    (arg) => arg === '-o' || arg === '--output'
  );
  if (outputIndex !== -1 && args[outputIndex + 1]) {
    outputPath = args[outputIndex + 1];
  }

  // Validate arguments
  if (!inputPath || !configPath) {
    console.error('❌ Error: Both input and config file paths are required\n');
    showHelp();
    process.exit(1);
  }

  try {
    console.log('🚀 OpenAPI to Postman Complete\n');

    let collection: PostmanCollection;

    // Check if input is OpenAPI or Postman collection
    if (isOpenApiFile(inputPath)) {
      console.log(`📝 Converting OpenAPI spec: ${inputPath}`);
      collection = await convertOpenApiToPostman(inputPath);
      console.log(`✅ Converted to Postman collection\n`);
    } else {
      console.log(`📖 Loading Postman collection: ${inputPath}`);
      const collectionJson = readFileSync(inputPath, 'utf8');
      collection = JSON.parse(collectionJson);
      console.log(
        `✅ Loaded collection with ${countRequests(collection)} requests\n`
      );
    }

    // Enrich collection
    console.log(`⚙️  Loading config: ${configPath}`);
    const enriched = enrichCollection(collection, configPath);
    console.log(
      `✅ Collection enriched to ${countRequests(enriched)} requests\n`
    );

    // Save enriched collection
    console.log(`💾 Saving to: ${outputPath}`);
    writeFileSync(outputPath, JSON.stringify(enriched, null, 2));
    console.log(`✅ Saved successfully\n`);

    console.log('🎉 Done! Your enriched Postman collection is ready.');
    console.log('\nNext steps:');
    console.log('1. Import the collection into Postman');
    console.log('2. Set up your environment variables');
    console.log('3. Start testing your API!\n');
  } catch (error) {
    console.error(
      '❌ Error:',
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

/**
 * Count total requests in a collection
 */
function countRequests(collection: PostmanCollection): number {
  let count = 0;

  function walk(items: any[]) {
    if (!items) return;
    items.forEach((item) => {
      if (item.request) {
        count++;
      } else if (item.item) {
        walk(item.item);
      }
    });
  }

  walk(collection.item);
  return count;
}

// Run CLI
main();

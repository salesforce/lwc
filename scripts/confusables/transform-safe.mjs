#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { globSync } from 'glob';
import { parse } from '@babel/parser';
import { analyzeFile } from './analyzer.mjs';
import { transformSource } from './transformer.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '../..');

console.log('🔄 Starting confusable character transformation (safe packages only)...\n');

// Only transform packages that are known to build successfully
const SAFE_PACKAGES = [
    'packages/@lwc/aria-reflection/**/*.ts',
    'packages/@lwc/features/**/*.ts',
    'packages/@lwc/signals/**/*.ts',
    'packages/@lwc/module-resolver/**/*.ts',
    'packages/@lwc/ssr-client-utils/**/*.ts',
    'packages/@lwc/integration-types/**/*.ts',
    'packages/@lwc/engine-server/**/*.ts',
];

const files = [];
for (const pattern of SAFE_PACKAGES) {
    const matched = globSync(pattern, {
        cwd: ROOT,
        ignore: [
            '**/__tests__/**',
            '**/*.test.ts',
            '**/*.spec.ts',
            '**/dist/**',
            '**/node_modules/**',
        ],
        absolute: true,
    });
    files.push(...matched);
}

console.log(`Found ${files.length} files to process\n`);

let transformed = 0;
for (const filePath of files) {
    try {
        const source = readFileSync(filePath, 'utf-8');
        const ast = parse(source, {
            sourceType: 'module',
            plugins: ['typescript', 'decorators-legacy'],
        });
        const analysis = analyzeFile(ast);
        const result = transformSource(ast, source, analysis);

        if (result !== source) {
            writeFileSync(filePath, result, 'utf-8');
            transformed++;
            console.log(`✓ ${filePath.replace(ROOT + '/', '')}`);
        }
    } catch (err) {
        console.error(`❌ ${filePath}: ${err.message}`);
    }
}

console.log(`\n✅ Transformed ${transformed} of ${files.length} files`);
console.log('\nThese packages build successfully with transformations:');
console.log('  - @lwc/aria-reflection');
console.log('  - @lwc/features');
console.log('  - @lwc/signals');
console.log('  - @lwc/module-resolver');
console.log('  - @lwc/ssr-client-utils');
console.log('  - @lwc/integration-types');
console.log('  - @lwc/engine-server');

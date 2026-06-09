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

console.log('🔄 Starting confusable character transformation (simple mode)...\n');

const pattern = 'packages/@lwc/*/src/**/*.ts';
const files = globSync(pattern, {
    cwd: ROOT,
    ignore: [
        '**/__tests__/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/dist/**',
        '**/node_modules/**',
        // Exclude packages with TypeScript issues
        'packages/@lwc/errors/**',
        'packages/@lwc/shared/**',
        'packages/@lwc/template-compiler/**',
        'packages/@lwc/babel-plugin-component/**',
        'packages/@lwc/style-compiler/**',
        'packages/@lwc/engine-core/**',
        'packages/@lwc/engine-dom/**',
        'packages/@lwc/synthetic-shadow/**',
        'packages/@lwc/ssr-compiler/**',
        'packages/@lwc/ssr-runtime/**',
        'packages/@lwc/wire-service/**',
    ],
    absolute: true,
});

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
console.log('\nRun: git diff --stat to see changes');

/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');

/** Directories containing LWC modules. */
const MODULE_DIRS = [path.join(ROOT, 'src/playground/modules')];

/**
 * Generates tsconfig paths option from the given directories containing modules.
 * Corresponds to lwc.config.json "dir" lookup.
 * @example generatePaths(moduleDirs) => {"foo/bar": ["src/modules/foo/bar"]}
 */
async function generatePaths(moduleDirs) {
    const paths = {};
    for (const dir of moduleDirs) {
        const namespaces = await fsp.readdir(dir, { withFileTypes: true });
        for (const ns of namespaces) {
            if (!ns.isDirectory()) continue;
            // `parentPath` is preferred for node >=20, but not present in <20
            const nsPath = path.join(ns.parentPath ?? ns.path, ns.name);
            const components = await fsp.readdir(nsPath, { withFileTypes: true });
            for (const cmp of components) {
                if (!cmp.isDirectory()) continue;
                // NOTE: We assume here that the component is well-formed
                const importName = `${ns.name}/${cmp.name}`;
                if (paths[importName]) {
                    throw new Error(`Found duplicate module definitions for ${importName}`);
                }
                const cmpPath = path.relative(ROOT, path.join(nsPath, cmp.name, cmp.name));
                // path.relative strips leading './', but tsconfig requires it
                const formattedCmpPath = `.${path.sep}${cmpPath}`;
                paths[importName] = [formattedCmpPath];
            }
        }
    }
    // workaround for: https://github.com/vitest-dev/vitest/issues/4567
    paths['rollup/parseAst'] = ['../../../node_modules/rollup/dist/parseAst'];
    return paths;
}

/** Parses the tsconfig.json file and updates the "paths" option. */
async function updatePaths(paths) {
    // As a hack to avoid needing a JSONC library, we just search and replace "paths": {...}
    // The expected format for each line within the paths object is `"key": ["value"],`
    const tsconfigPath = path.join(ROOT, 'tsconfig.json');
    const tsconfigText = await fsp.readFile(tsconfigPath, 'utf8');
    const regex = /"paths": \{\n(\s+)[\s\S]+?\}/;
    const match = tsconfigText.match(regex);
    if (!match) {
        // Shouldn't happen, but if you're here because it did, add "paths" to the compiler options
        // with dummy values and re-run this script
        throw new Error('No "paths" option in tsconfig.json?!');
    }
    const spaces = match[1];
    const pathsLines = Object.entries(paths).map(
        ([key, val]) => `${spaces}"${key}": ${JSON.stringify(val)}`
    );
    const replacement = `"paths": {\n${pathsLines.join(',\n')}\n${spaces.slice(0, -4)}}`;
    const tsconfigUpdated = tsconfigText.replace(regex, replacement);
    await fsp.writeFile(tsconfigPath, tsconfigUpdated, 'utf8');
    return { original: tsconfigText, updated: tsconfigUpdated };
}

function checkIfChanged({ original, updated }) {
    if (process.argv.includes('--check') && original !== updated) {
        console.warn('"paths" has changed in tsconfig.json. Please commit the changes.');
        process.exitCode = 1;
    }
}

await generatePaths(MODULE_DIRS).then(updatePaths).then(checkIfChanged);

/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Checks that, for all published packages, any `import`ed packages are declared as explicit dependencies.
// This avoids issues with transitive dependencies being treated as implicit dependencies, which
// may break tools like Yarn PnP (see: https://github.com/salesforce/lwc/issues/3540)

import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { builtinModules } from 'node:module';
import { init, parse } from 'es-module-lexer';
import { SCOPED_PACKAGES } from '../shared/packages.mjs';

async function main() {
    const errors = [];

    for (const { package: pkg, path: dir } of SCOPED_PACKAGES) {
        const {
            dependencies,
            peerDependencies,
            private: isPrivate,
            module: moduleEntry,
            types,
        } = pkg;

        if (isPrivate) {
            continue; // not public, we don't care
        }

        const allDependencies = { ...dependencies, ...peerDependencies };

        // We use three fields for exports: "main" for CJS, "module" for ESM, "types" for, y'know.
        // If a package has a "module" defined, we use that as the source of truth, otherwise we
        // assume it's a types-only package and we check that, instead.
        const fileToCheck = join(dir, moduleEntry ?? types);

        const esmSource = readFileSync(fileToCheck, 'utf-8');

        await init;
        const [importeds] = parse(esmSource);

        for (const { n: imported } of importeds) {
            // for deep imports like 'parse5/lib/foo' or '@owner/pkg/lib/bar'
            const importedPackage = imported
                .split('/')
                .slice(0, imported.startsWith('@') ? 2 : 1)
                .join('/');

            if (
                builtinModules.includes(importedPackage) ||
                builtinModules.includes(importedPackage.replace(/^node:/, ''))
            ) {
                // ignore node built-ins like 'fs', 'path', etc.
                continue;
            }

            if (!(importedPackage in allDependencies)) {
                errors.push(
                    `${pkg} imports "${imported}", but it is not declared ` +
                        'as a dependency/peerDependency in package.json.'
                );
            }
        }
    }

    for (const error of errors) {
        console.error(error);
    }
    if (errors.length) {
        console.error(
            '\nAll external imports must be declared as a dependency or peerDependency (NOT devDependency).' +
                '\nPlease check the relevant package.json files.\n'
        );
        process.exit(1);
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});

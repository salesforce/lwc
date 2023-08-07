/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Checks that, for all published packages, any `import`ed packages are declared as explicit dependencies.
// This avoids issues with transitive dependencies being treated as implicit dependencies, which
// may break tools like Yarn PnP (see: https://github.com/salesforce/lwc/issues/3540)

const path = require('node:path');
const fs = require('node:fs');
const { builtinModules } = require('node:module');
const { globSync } = require('glob');
const { init, parse } = require('es-module-lexer');

async function main() {
    const errors = [];
    const pkgJsonFiles = globSync(path.join(__dirname, '../../packages/@lwc/*/package.json'));

    for (const pkgJsonFile of pkgJsonFiles) {
        const { dependencies, peerDependencies, private } = JSON.parse(
            fs.readFileSync(pkgJsonFile, 'utf-8')
        );

        if (private) {
            continue; // not public, we don't care
        }

        const allDependencies = { ...dependencies, ...peerDependencies };

        const esmDistFile = path.join(path.dirname(pkgJsonFile), 'dist/index.js');

        const esmSource = fs.readFileSync(esmDistFile, 'utf-8');

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
                    `${pkgJsonFile
                        .split(path.sep)
                        .slice(-3, -1)
                        .join(path.sep)} imports "${imported}", but it is not declared ` +
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

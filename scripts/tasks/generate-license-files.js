/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const path = require('node:path');
const { readFile, writeFile, stat, readdir } = require('node:fs/promises');
const prettier = require('prettier');
const { BUNDLED_DEPENDENCIES } = require('../shared/bundled-dependencies.js');

// Generate our LICENSE files for each package, including any bundled dependencies
// This is modeled after how Rollup does it:
// https://github.com/rollup/rollup/blob/0b665c3/build-plugins/generate-license-file.ts

// Async fs.existsSync
async function exists(filename) {
    try {
        await stat(filename);
        return true;
    } catch (err) {
        return false;
    }
}

async function findLicenseText(depName) {
    // Iterate through possible names for the license file
    const names = ['LICENSE', 'LICENSE.md', 'LICENSE.txt'];

    // We would use require.resolve, but 1) that doesn't work if the module lacks a "main" in its `package.json`,
    // and 2) it gives us a deep `./path/to/index.js` which makes it harder to find a top-level LICENSE file. So
    // just assume that our deps are hoisted to the top-level `node_modules`.
    const resolvedDepPath = path.join(process.cwd(), 'node_modules', depName);

    for (const name of names) {
        const fullFilePath = path.join(resolvedDepPath, name);
        if (await exists(fullFilePath)) {
            return (await readFile(fullFilePath, 'utf-8')).trim();
        }
    }

    // Get the license from the package.json if we can't find it elsewhere
    const pkgJson = JSON.parse(await readFile(path.join(resolvedDepPath, 'package.json'), 'utf-8'));

    const { license, version } = pkgJson;

    return `${license} license defined in package.json in v${version}.`;
}

async function main() {
    const coreLicense = await readFile('LICENSE-CORE.md', 'utf-8');

    const bundledLicenses = await Promise.all(
        BUNDLED_DEPENDENCIES.map(async (depName) => {
            return `## ${depName}\n\n` + (await findLicenseText(depName));
        })
    );
    const newLicense =
        `# LWC core license\n\n${coreLicense}\n# Licenses of bundled dependencies\n\n${bundledLicenses.join(
            '\n'
        )}`.trim() + '\n';

    const formattedLicense = await prettier.format(newLicense, {
        parser: 'markdown',
    });

    // Check against current top-level license for changes
    const shouldWarnChanges =
        process.argv.includes('--test') &&
        formattedLicense !== (await readFile('LICENSE.md', 'utf-8'));

    // Top level license
    await writeFile('LICENSE.md', formattedLicense, 'utf-8');

    // License file for each package as well, so that we publish it to npm
    const atLwcPackages = (await readdir('packages/@lwc'))
        // skip dotfiles like .DS_Store
        .filter((_) => !_.startsWith('.'))
        .map((_) => `@lwc/${_}`);
    const packages = ['lwc', ...atLwcPackages];

    await Promise.all(
        packages.map(async (pkg) => {
            await writeFile(path.join('packages/', pkg, 'LICENSE.md'), formattedLicense, 'utf-8');
        })
    );

    if (shouldWarnChanges) {
        const relativeFilename = path.relative(process.cwd(), __filename);
        throw new Error(
            'Either the LWC core license or the license of a bundled dependency has been updated.\n' +
                `Please run \`node ${relativeFilename}\` and commit the result.`
        );
    }
}

main().catch((err) => {
    console.error(err);
    process.exitCode ||= 1;
});

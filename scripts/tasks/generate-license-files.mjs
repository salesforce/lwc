import path from 'node:path';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';
import { BUNDLED_DEPENDENCIES } from '../shared/bundled-dependencies.js';
import { ALL_PACKAGES, SCOPED_PACKAGES } from '../shared/packages.mjs';

// We're using ESM here, but some packages still only export CJS, so we also need `require`
const require = createRequire(import.meta.url);

// Generate our LICENSE files for each package, including any bundled dependencies
// This is modeled after how Rollup does it:
// https://github.com/rollup/rollup/blob/0b665c3/build-plugins/generate-license-file.ts

// Async fs.existsSync
async function exists(filename) {
    try {
        await stat(filename);
        return true;
    } catch (_err) {
        return false;
    }
}

/**
 * Tries `require.resolve` with additional paths (`packages/@lwc/___/node_modules`)
 * and `import.meta.resolve` (unmodified) to find a package's entrypoint.
 */
function tryResolve(specifier) {
    try {
        // As far as I can tell, there's no way to modify the `import` lookup paths
        return fileURLToPath(import.meta.resolve(specifier));
    } catch (err) {
        // We expect to see missing packages, but throw other errors
        if (err.code !== 'ERR_MODULE_NOT_FOUND') {
            throw err;
        }
    }
    // `require.resolve` accepts a second parameter of additional places to look
    return require.resolve(specifier, {
        paths: SCOPED_PACKAGES.map((pkg) => path.join(pkg.path, 'node_modules')),
    });
}

/**
 * Finds a dependency in our monorepo.
 * @param {string} specifier - package name to find
 */
function findPackageDirectory(specifier) {
    const resolved = tryResolve(specifier);
    // An import can resolve to a nested directory, e.g. dist/index.js. We want the package
    // root, which will always be the last node_modules/${specifier}.
    const lookup = path.join('/node_modules', specifier);
    return resolved.slice(0, resolved.lastIndexOf(lookup) + lookup.length);
}

async function findLicenseText(depName) {
    // Iterate through possible names for the license file
    const names = ['LICENSE', 'LICENSE.md', 'LICENSE.txt'];

    const resolvedDepPath = findPackageDirectory(depName);

    for (const name of names) {
        const fullFilePath = path.join(resolvedDepPath, name);
        if (await exists(fullFilePath)) {
            return (await readFile(fullFilePath, 'utf-8')).trim();
        }
    }

    // Get the license from the package.json if we can't find it elsewhere
    const { license, version } = JSON.parse(
        await readFile(path.join(resolvedDepPath, 'package.json'), 'utf-8')
    );

    if (!license) {
        throw new Error(`${depName} does not define a license.`);
    }

    return `"${license}" license defined in package.json in v${version}.`;
}

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
    formattedLicense !== (await readFile('LICENSE.md', 'utf-8')).replace(/\r\n/g, '\n');

// Top level license
await writeFile('LICENSE.md', formattedLicense, 'utf-8');

// License file for each package as well, so that we publish it to npm

await Promise.all(
    ALL_PACKAGES.map(async (pkg) => {
        await writeFile(path.join(pkg.path, 'LICENSE.md'), formattedLicense, 'utf-8');
    })
);

if (shouldWarnChanges) {
    const relativeFilename = path.relative(process.cwd(), import.meta.filename);
    throw new Error(
        'Either the LWC core license or the license of a bundled dependency has been updated.\n' +
            `Please run \`node ${relativeFilename}\` and commit the result.`
    );
}

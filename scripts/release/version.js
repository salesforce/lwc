/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');
const semver = require('semver');
const { globSync } = require('glob');

const rootPath = path.resolve(__dirname, '../../');
const rootPackageJsonPath = `${rootPath}/package.json`;
const rootPackageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf-8'));

(async () => {
    const rawVersion = await getVersion();
    const parsedVersion = await parseVersion(rawVersion);
    updatePackages(parsedVersion);
})().catch(console.error);

async function getVersion() {
    if (process.argv[2]) {
        return process.argv[2];
    }
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    const answer = await new Promise((resolve) =>
        rl.question('Enter a new LWC version: ', resolve)
    );
    rl.close();
    return answer;
}

async function parseVersion(rawVersion) {
    try {
        const exact = semver.valid(rawVersion);
        if (exact) {
            // answer is a semver version
            return exact;
        }
        const incremented = semver.inc(rootPackageJson.version, rawVersion);
        if (incremented) {
            // answer is a semver release type (major/minor/etc.)
            return incremented;
        }
        throw new Error(`Invalid release version: ${rawVersion}`);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

function updatePackages(newVersion) {
    try {
        const packagesToUpdate = getPackagesToUpdate();
        const workspacesPackageJson = new Set(
            packagesToUpdate.map(({ packageJson }) => packageJson.name)
        );

        for (const { packageJson } of packagesToUpdate) {
            packageJson.version = newVersion;
            // Look for different types of dependencies
            // ex: dependencies, devDependencies, peerDependencies
            const pkgDependencyTypes = Object.keys(packageJson).filter((key) =>
                key.match(/.*[dD]ependencies/)
            );
            // Update dependencies in package.json
            for (const pkgDependencyType of pkgDependencyTypes) {
                for (const pkgDepName of Object.keys(packageJson[pkgDependencyType])) {
                    if (workspacesPackageJson.has(pkgDepName)) {
                        // ex: packageJson[devDependencies][@lwc/template-compiler]
                        packageJson[pkgDependencyType][pkgDepName] = newVersion;
                    }
                }
            }
        }

        // Update package.json files and print updated packges
        for (const { originalVersion, packageJson, packageJsonPath } of packagesToUpdate) {
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 4) + '\n');
            console.log(
                `Updated ${packageJson.name} from ${originalVersion} to ${packageJson.version}`
            );
        }
    } catch (error) {
        console.error(error);
    }
}

function getPackagesToUpdate() {
    const packagesToUpdate = [];

    const workspacePkgs = rootPackageJson.workspaces.reduce(
        (accWorkspacePkgs, workspace) => {
            const workspacePkg = globSync(`${workspace}/package.json`);
            return [...accWorkspacePkgs, ...workspacePkg];
        },
        [rootPackageJsonPath]
    );

    for (const pkgName of workspacePkgs) {
        const packageJsonPath = path.resolve(rootPath, pkgName);
        if (fs.existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            packagesToUpdate.push({
                originalVersion: packageJson.version,
                packageJsonPath,
                packageJson,
            });
        }
    }

    return packagesToUpdate;
}

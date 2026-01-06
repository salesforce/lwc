/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import semver from 'semver';
import { globSync } from 'glob';

const rootPath = path.resolve(import.meta.dirname, '../../');
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
        const current = rootPackageJson.version;
        const exact = semver.valid(rawVersion);
        if (exact) {
            // answer is a semver version
            if (semver.gt(exact, current)) {
                return exact;
            }
            throw new Error(`Release version ${rawVersion} is not greater than ${current}.`);
        }
        const incremented = semver.inc(current, rawVersion);
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

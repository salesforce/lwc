#!/usr/bin/env node

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const glob = require('glob');

(async () => {
    const newVersion = await promptVersion();
    updatePackages(newVersion);
})();

async function promptVersion() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    try {
        const answer = await new Promise((resolve) =>
            rl.question('Enter a new LWC version: ', resolve)
        );
        return answer;
    } catch (error) {
        console.error(error);
    } finally {
        rl.close();
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
                key.match(/.*[dD]ependencies.*/g)
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
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 4));
            console.log(
                `Updated ${packageJson.name} from ${originalVersion} to ${packageJson.version}`
            );
        }
    } catch (error) {
        console.error(error);
    }
}

function getPackagesToUpdate() {
    const rootPath = path.resolve(__dirname, '../../');
    const rootPackageJson = JSON.parse(fs.readFileSync(`${rootPath}/package.json`, 'utf-8'));
    const packagesToUpdate = [];

    const workspacePkgs = rootPackageJson.workspaces.reduce((accWorkspacePkgs, workspace) => {
        const workspacePkg = glob.sync(`${workspace}/package.json`);
        return [...accWorkspacePkgs, ...workspacePkg];
    }, []);

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

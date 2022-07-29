#!/usr/bin/env node

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import child_process from 'child_process';
import fs from 'fs';
import path from 'path';
import { execaCommandSync } from 'execa';
import semver from 'semver';
import inquirer from 'inquirer';

const newVersion = await promptVersion();
updatePackages(newVersion);

async function promptVersion() {
    const tag = execaCommandSync('git describe --tags --abbrev=0 HEAD').stdout;

    const patch = semver.inc(tag, 'patch');
    const minor = semver.inc(tag, 'minor');
    const major = semver.inc(tag, 'major');

    const { prompt: promptAnswer } = await inquirer.prompt([
        {
            type: 'list',
            name: 'prompt',
            messageL: `Select a new version, currently ${tag} based on latest tags`,
            choices: [
                { value: patch, name: `Patch (${patch})` },
                { value: minor, name: `Minor (${minor})` },
                { value: major, name: `Major (${major})` },
                { value: 'CUSTOM', name: 'Custom Version' },
            ],
            pageSize: 4,
        },
    ]);

    if (promptAnswer === 'CUSTOM') {
        const inputAnswer = await inquirer.prompt([
            {
                type: 'input',
                name: 'input',
                message: 'Enter a custom version',
                filter: semver.valid,
                validate: (v) => v !== null || 'Must be a valid semver version',
            },
        ]);

        return inputAnswer.input;
    }

    return promptAnswer;
}

function updatePackages(newVersion) {
    try {
        if (!newVersion) {
            throw new Error(`Encountered an error, unexpected version provided ${newVersion}`);
        }

        const mismatchedWorkspaceDependencies = getMismatchedWorkspaceDependencies();
        if (mismatchedWorkspaceDependencies.length) {
            throw new Error(
                `There are mismatching workspace dependencies, please resolve before bumping the versions: 
                ${mismatchedWorkspaceDependencies.join('\n')}`
            );
        }

        const packagesToUpdate = getPackagesToUpdate(newVersion);
        for (const packageJson of packagesToUpdate) {
            fs.writeFileSync(
                packageJson.packageJsonLocation,
                JSON.stringify(packageJson.newPackageJson, null, 4)
            );
        }

        // Validate newly created packages have no mismatching workspace dependencies
        const updatedWorkspaceMismatchedDependencies = getMismatchedWorkspaceDependencies();
        if (updatedWorkspaceMismatchedDependencies.length) {
            // Revert changes when mismatching workspace dependencies are detected
            for (const { packageJsonLocation, oldPackageJson } of packagesToUpdate) {
                fs.writeFileSync(packageJsonLocation, JSON.stringify(oldPackageJson, null, 4));
            }
            throw new Error(`Version bump resulted in mismatching workspace dependencies, reverting to previous package.json.  
            After the version bump script ran the following mismatching workspace depenedencies were detected: 
            ${updatedWorkspaceMismatchedDependencies.join('\n')}
        `);
        }

        for (const { newPackageJson, oldPackageJson } of packagesToUpdate) {
            console.log(
                `Updating package ${newPackageJson.name} from ${oldPackageJson.version} to ${newPackageJson.version}`
            );
        }
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

function getPackagesToUpdate(newVersion) {
    const output = child_process.execSync('yarn --silent workspaces info');
    const workspacesInfo = Object.values(JSON.parse(output));
    const packagesToUpdate = workspacesInfo.map(({ location, workspaceDependencies }) => {
        const packageJsonLocation = `${path.resolve(path.dirname('..'), location)}/package.json`;
        const oldPackageJson = JSON.parse(fs.readFileSync(packageJsonLocation, 'utf-8'));
        const newPackageJson = { ...oldPackageJson };
        // Look for different types of dependencies
        // ex: dependencies, devDependencies, peerDependencies
        const packageDependencyTypes = Object.keys(newPackageJson).filter((type) =>
            type.match(/.*[dD]ependencies.*/g)
        );

        newPackageJson.version = newVersion;

        // Update the package version for all dependencies
        // ex:
        //  {
        //    "devDependencies": {
        //        "@lwc/template-compiler": "^7.18.9",
        //  }
        for (const dependencyType of packageDependencyTypes) {
            for (const dependencyName of workspaceDependencies) {
                const currentVersion = newPackageJson[dependencyType][dependencyName];
                if (currentVersion && currentVersion !== newVersion) {
                    newPackageJson[dependencyType][dependencyName] = newVersion;
                }
            }
        }

        return {
            packageJsonLocation,
            newPackageJson,
            oldPackageJson,
        };
    });

    return packagesToUpdate;
}

function getMismatchedWorkspaceDependencies() {
    const output = child_process.execSync('yarn --silent workspaces info');
    const workspacesInfo = Object.values(JSON.parse(output));
    const mismatchedDependencies = workspacesInfo.reduce(
        (acc, { location, mismatchedWorkspaceDependencies }) => {
            if (mismatchedWorkspaceDependencies.length) {
                acc.push(
                    `${location} - dependencies: ${mismatchedWorkspaceDependencies.join(', ')}`
                );
            }
            return acc;
        },
        []
    );

    return mismatchedDependencies;
}

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
            messageL: `Select a new version, currently ${tag}`,
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
        const answer = await inquirer.prompt([
            {
                type: 'input',
                name: 'input',
                message: 'Enter a custom version',
                filter: semver.valid,
                validate: (v) => v !== null || 'Must be a valid semver version',
            },
        ]);

        return answer.input;
    }

    return promptAnswer;
}

function updatePackages(newVersion) {
    try {
        const output = child_process.execSync('yarn --silent workspaces info');
        const workspacesInfo = Object.values(JSON.parse(output));

        // validate there are no mismatching dependencies
        const hasMismatchedWorkspaceDependencies = workspacesInfo.includes(
            ({ mismatchedWorkspaceDependencies }) => mismatchedWorkspaceDependencies.length
        );
        if (hasMismatchedWorkspaceDependencies) {
            const misMatchedDependencies = workspacesInfo.map(
                ({ location, mismatchedWorkspaceDependencies }) =>
                    `${location}: ${mismatchedWorkspaceDependencies.join(', ')}`
            );
            throw new Error(`There are missmatching workspace dependencies, please resolve before bumping the versions:
        ${misMatchedDependencies.join('\n')}
        `);
        }

        const updatedPackages = workspacesInfo.map(({ location, workspaceDependencies }) => {
            const packageJsonLocation = `${path.resolve(
                path.dirname('..'),
                location
            )}/package.json`;
            const packageJson = JSON.parse(fs.readFileSync(packageJsonLocation, 'utf-8'));
            // Look for different types of dependencies ex: dependencies, devDependencies, peerDependencies
            const packageDependencyTypes = Object.keys(packageJson).filter((type) =>
                type.match(/.*[dD]ependencies.*/g)
            );

            packageJson.version = newVersion;

            for (const dependencyType of packageDependencyTypes) {
                for (const dependencyName of workspaceDependencies) {
                    const currentVersion = packageJson[dependencyType][dependencyName];
                    if (currentVersion !== newVersion) {
                        packageJson[dependencyType][dependencyName] = newVersion;
                    }
                }
            }

            return [packageJsonLocation, JSON.stringify(packageJson, null, 4)];
        });

        // validate all the dependencies match again here
        for (const [location, serializedJson] of updatedPackages) {
            fs.writeFileSync(location, serializedJson);
        }
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const execa = require('execa');
const { lookup } = require('mime-types');

// To invoke this from the commandline you need the following to env vars to exist:
//
// RELEASE_BUCKET_NAME
// RELEASE_SECRET_ACCESS_KEY
// RELEASE_ACCESS_KEY_ID
// RELEASE_REGION
//

const PACKAGE_DEPENDENCIES = new Set([
    '@lwc/babel-plugin-component',
    '@lwc/compiler',
    '@lwc/engine',
    '@lwc/errors',
    '@lwc/jest-preset',
    '@lwc/jest-resolver',
    '@lwc/jest-serializer',
    '@lwc/jest-transformer',
    '@lwc/module-resolver',
    '@lwc/rollup-plugin',
    '@lwc/style-compiler',
    '@lwc/template-compiler',
    '@lwc/test-utils',
    '@lwc/wire-service',
]);

const CONFIG = {
    accessKeyId: process.env.RELEASE_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.RELEASE_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.RELEASE_REGION || process.env.AWS_REGION,
};
const BUCKET = process.env.RELEASE_BUCKET_NAME || process.env.BUCKETEER_BUCKET_NAME || process.env.AWS_BUCKET_NAME;
const TEN_YEARS = 1000 * 60 * 60 * 24 * 365 * 10;

const S3 = new AWS.S3(CONFIG);
const PREFIX = 'public';
const HOST = `https://${BUCKET}.s3.amazonaws.com`;

async function exec(command, args, options) {
    console.log(`\n\tRunning: \`${command} ${args.join(' ')}\``);
    const { stdout } = await execa(command, args, options);
    return stdout;
}

function generateUrl(packageName, sha) {
    return [PREFIX, 'builds', packageName, 'canary', `${sha}.tgz`].join('/');
}

function pushPackage({ sha, packageName, packageTar }) {
    return new Promise(function(resolve, reject) {
        const url = generateUrl(packageName, sha);
        S3.putObject(
            {
                Bucket: BUCKET,
                Key: url,
                Body: fs.readFileSync(packageTar),
                Expires: new Date(Date.now() + TEN_YEARS),
                ContentType: lookup(url) || undefined,
            },
            function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(url);
                }
            },
        );
    });
}

async function run() {
    const [sha, customPath] = process.argv.slice(2);
    const cwd = process.cwd();
    const absPath = path.resolve(cwd, customPath || 'packages');

    if (!sha) {
        throw new Error('Pushing packages require a git sha commit to pin the package');
    }

    const pkgs = fs.readdirSync(absPath);

    if (pkgs.length) {
        console.log('Creating package artifacts for SHA:', sha);

        for (const pkgName of pkgs) {
            // Find package.json
            const jsonPath = path.join(absPath, pkgName, 'package.json');
            const pkgJson = require(jsonPath);

            // Override package.json
            const { name, version } = pkgJson;
            const fullPath = path.join(absPath, pkgName);
            pkgJson._originalversion = version;
            pkgJson.version = `${version}-canary+${sha}`;

            // Rewrite dependencies
            ['dependencies', 'devDependencies'].forEach(key => {
                if (pkgJson[key]) {
                    Object.keys(pkgJson[key]).forEach(dep => {
                        if (PACKAGE_DEPENDENCIES.has(dep)) {
                            pkgJson[key][dep] = HOST + '/' + generateUrl(dep, sha);
                        }
                    });
                }
            });

            fs.writeFileSync(jsonPath, JSON.stringify(pkgJson, null, 2), { encoding: 'utf-8' });

            // Generate tar artifact
            const tar = await exec('npm', ['pack'], { cwd: fullPath });
            const tarPath = path.join(fullPath, tar);

            // Push package to S3
            process.stdout.write(`Pushing package: ${pkgName}...`);
            const url = await pushPackage({ packageName: name, sha, packageTar: tarPath });
            process.stdout.write(` [DONE]\n Uploaded to: ${HOST}/${url}\n`);
        }
    } else {
        console.log('No packages found');
    }
}

run().catch(function(err) {
    console.log(err);
});

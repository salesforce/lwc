/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const glob = require('glob');
const { lookup } = require('mime-types');

const CONFIG = {
    accessKeyId: process.env.RELEASE_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.RELEASE_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.RELEASE_REGION || process.env.AWS_REGION
};
const BUCKET = process.env.RELEASE_BUCKET_NAME || process.env.BUCKETEER_BUCKET_NAME || process.env.AWS_BUCKET_NAME;
const TEN_YEARS = 1000 * 60 * 60 * 24 * 365 * 10;

const S3 = new AWS.S3(CONFIG);
const PREFIX = 'public';
const HOST = `https://${BUCKET}.s3.amazonaws.com`;

function pushPackage({ sha, packageName, packageTar }) {
    return new Promise(function (resolve, reject) {
        const url = path.join(PREFIX, 'builds', packageName, 'canary', `${sha}.tgz`);
        S3.putObject(
            {
                Bucket: BUCKET,
                Key: url,
                Body: fs.readFileSync(packageTar),
                Expires: new Date(Date.now() + TEN_YEARS),
                ContentType: lookup(url) || undefined,
            }, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(url)
                }
            }
        )
    });
}

async function run() {
    const [sha, customPath] = process.argv.slice(2);
    const cwd = process.cwd();
    const absPath = path.resolve(cwd, customPath || 'packages');

    if (!sha) {
        throw new Error('Pushing packages require a git sha commit to pin the package');
    }

    const pkgs = glob.sync('*/*.tgz', { cwd: absPath });

    if (pkgs.length) {
        console.log('Creating package artifacts for SHA:', sha);

        for (const pkg of pkgs) {
            const [pkgName, ] = pkg.split(path.sep);
            const jsonPath = path.join(absPath, pkgName, 'package.json');
            const pkgJson = require(jsonPath);
            const { name, version } = pkgJson;
            const fullPath = path.join(absPath, pkg);
            pkgJson._originalversion = version;
            pkgJson.version = `${version}-canary+${sha}`;

            fs.writeFileSync(jsonPath, JSON.stringify(pkg, null, 2), { encoding: 'utf-8' });
            process.stdout.write(`Pushing package: ${pkgName}...`);
            const url = await pushPackage({ packageName: name, sha, packageTar : fullPath });
            process.stdout.write(` [DONE]\n Uploaded to: ${HOST}/${url}\n`);
        }
    } else {
        console.log('No packages found');
    }
}

run()
.catch(function(err) {
    console.log(err);
})

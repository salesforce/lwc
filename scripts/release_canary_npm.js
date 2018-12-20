const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const glob = require('glob');
const { lookup } = require('mime-types');

function getConfig() {
    return {
        accessKeyId: process.env.RELEASE_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.RELEASE_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.RELEASE_REGION || process.env.AWS_REGION
    };
}

const S3 = new AWS.S3({ ...getConfig() });
const BUCKET = process.env.RELEASE_BUCKET_NAME || process.env.BUCKETEER_BUCKET_NAME || process.env.AWS_BUCKET_NAME;
const TEN_YEARS = 1000 * 60 * 60 * 24 * 365 * 10;
const PREFIX = 'public';
const HOST = `https://${BUCKET}.s3.amazonaws.com`;

function listObjects(packageName) {
    return new Promise(function (reject, resolve) {
        S3.listObjectsV2({
            Bucket: BUCKET,
            Prefix: PREFIX + '/builds/' + (packageName || ''),
            Delimiter: PREFIX + '/',
        }, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

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

    if (sha === 'list') {
        const list = await listObjects(customPath);
        console.log(list);
        return;
    }

    if (!sha) {
        throw new Error('Pushing packages require a git sha commit to pin the package');
    }

    const pkgs = glob.sync('*/*.tgz', { cwd: absPath });

    if (pkgs.length) {
        console.log('Creating package artifacts for SHA:', sha);

        for (const pkg of pkgs) {
            const [pkgName, ] = pkg.split(path.sep);
            const { name } = require(path.join(absPath, pkgName, 'package.json'));
            const fullPath = path.join(absPath, pkg);
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

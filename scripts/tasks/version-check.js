'use strict';

const path = require('path');
const glob = require('glob');
const semver = require('semver');

const PACKAGES_DIR = path.resolve(__dirname, '../../packages');
const PACKAGES = glob.sync('*/package.json', {
    absolute: true,
    cwd: PACKAGES_DIR,
});

let areVersionsInSync = true;
for (const location of PACKAGES) {
    const {
        name,
        peerDependencies = {},
        devDependencies = {},
    } = require(location);

    for (const dep of Object.keys(peerDependencies)) {
        if (
            devDependencies.hasOwnProperty(dep) &&
            !semver.satisfies(devDependencies[dep], peerDependencies[dep])
        ) {
            const error = [
                `Peer dependency version mismatch of ${dep} in ${name}.`,
                `(Expected: ${peerDependencies[dep]}, Actual: ${devDependencies[dep]})`,
            ].join(' ');

            console.error(error);
            areVersionsInSync = false;
        }
    }
}

if (!areVersionsInSync) {
    process.exit(1);
}

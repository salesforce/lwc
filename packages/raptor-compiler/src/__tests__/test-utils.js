/* eslint-env node */

const fs = require('fs');
const path = require('path');

const FIXTURE_DIR = path.join(__dirname, 'fixtures');

function fixturePath(location) {
    return path.join(FIXTURE_DIR, location);
}

function readFixture(location) {
    return fs.readFileSync(fixturePath(location), 'utf-8');
}

function pretify(str) {
    return str.toString().replace(/^\s+|\s+$/, '');
}

module.exports = {
    fixturePath,
    readFixture,
    pretify
};

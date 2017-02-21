/* eslint-env node, mocha */
import * as fs from 'fs';
import * as path from 'path';

import assert from 'power-assert';
import {compile} from '../src/index';

function trim(str) {
    return str.toString().replace(/^\s+|\s+$/, '');
}

const BASE_CONFIG = {};
const skipTests = [
    '.babelrc',
    '.DS_Store',
];
const fixturesDir = path.join(__dirname, 'fixtures');

describe('emit asserts for namespacedFolder: ', () => {
    const nsFolder = 'namespacedFolder';
    it('Compile with no options', () => {
        const ns1 = '/ns1';
        const cmp1 = '/cmp1/cmp1.js';
        const fixtureCmpDir = path.join(fixturesDir, nsFolder, ns1, cmp1);

        return runCompile(fixtureCmpDir)
        .then((result) => {
            const actual = result.code;
            //console.log(actual);
            const expected = fs.readFileSync(path.join(fixturesDir, nsFolder, 'expected-no-options.js'));
            assert.equal(trim(actual), trim(expected));
        })
    });

    it('Compile with `mapping namespace from path`', () => {
        const ns1 = '/ns1';
        const cmp1 = '/cmp1/cmp1.js';
        const fixtureCmpDir = path.join(fixturesDir, nsFolder, ns1, cmp1);

        return runCompile(fixtureCmpDir, { mapNamespaceFromPath: true })
        .then((result) => {
            const actual = result.code;
            //console.log(actual);
            const expected = fs.readFileSync(path.join(fixturesDir, nsFolder, 'expected-mapped-ns1.js'));
            assert.equal(trim(actual), trim(expected));
        })
    });

    it('Compile with `mapping namespace from path` (within components folder)', () => {
        const ns2 = '/ns2/components';
        const cmp1 = '/cmp1/cmp1.js';
        const fixtureCmpDir = path.join(fixturesDir, nsFolder, ns2, cmp1);

        return runCompile(fixtureCmpDir, { mapNamespaceFromPath: true })
        .then((result) => {
            const actual = result.code;
            //console.log(actual);
            const expected = fs.readFileSync(path.join(fixturesDir, nsFolder, 'expected-mapped-ns2.js'));
            assert.equal(trim(actual), trim(expected));
        })
    });
});

function runCompile(filePath, options = {}) {
    const config = Object.assign({}, BASE_CONFIG, options);
    return compile(filePath, config);
}


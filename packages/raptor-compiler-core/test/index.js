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

describe('emit asserts for namespaced_folder: ', () => {
    const nsFolder = 'namespaced_folder';
    it('Compile with no options - no namespace', () => {
        const ns1 = '/custom';
        const cmp1 = '/foo-bar.js';
        const fixtureCmpDir = path.join(fixturesDir, nsFolder, ns1, cmp1);

        return runCompile(fixtureCmpDir)
        .then((result) => {
            const actual = result.code;
            //console.log(actual);
            const expected = fs.readFileSync(path.join(fixturesDir, nsFolder, 'expected-no-options.js'));
            assert.equal(trim(actual), trim(expected));
        })
    });

    it('Compile with no options - default namespace', () => {
        const ns1 = '/default';
        const cmp1 = '/default.js';
        const fixtureCmpDir = path.join(fixturesDir, nsFolder, ns1, cmp1);

        return runCompile(fixtureCmpDir)
        .then((result) => {
            const actual = result.code;
            //console.log(actual);
            const expected = fs.readFileSync(path.join(fixturesDir, nsFolder, 'expected-no-options-unknown-ns.js'));
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

describe('emit asserts for embedded sources: ', () => {

    it('Compile using sources', () => {
        const html = fs.readFileSync(path.join(fixturesDir, 'class_and_template/class_and_template.html')).toString();
        const js = fs.readFileSync(path.join(fixturesDir, 'class_and_template/class_and_template.js')).toString();
        const entry = '/customNs/class_and_template/class_and_template.js';

        const opts = {
            sourceTemplate: html,
            sourceClass: js,
            mapNamespaceFromPath: true
        };

        return runCompile(entry, opts)
        .then((result) => {
            const actual = result.code;
            //console.log(actual);
            const expected = fs.readFileSync(path.join(fixturesDir, 'expected-sources-namespaced.js'));
            assert.equal(trim(actual), trim(expected));
        })
    });

    it('Compile using sources and format', () => {
        const html = fs.readFileSync(path.join(fixturesDir, 'class_and_template/class_and_template.html')).toString();
        const js = fs.readFileSync(path.join(fixturesDir, 'class_and_template/class_and_template.js')).toString();
        const entry = 'myns/class_and_template/class_and_template.js';

        const opts = {
            sourceTemplate: html,
            sourceClass: js,
            mapNamespaceFromPath: true,
            format: 'aura',
        };

        return runCompile(entry, opts)
        .then((result) => {
            const actual = result.code;
            //console.log(actual);
            const expected = fs.readFileSync(path.join(fixturesDir, 'expected-sources-namespaced-format.js'));
            assert.equal(trim(actual), trim(expected));
        })
    });

    it('Compile using folder sources and format', () => {
        const html = fs.readFileSync(path.join(fixturesDir, 'relative_import/relative_import.html')).toString();
        const js = fs.readFileSync(path.join(fixturesDir, 'relative_import/relative_import.js')).toString();
        const relative = fs.readFileSync(path.join(fixturesDir, 'relative_import/relative.js')).toString();

        const entry = 'myns/components/relative_import/relative_import.js';

        const opts = {
            mapNamespaceFromPath: true,
            format: 'aura',
            sources: {
                'relative_import.html': html,
                'relative_import.js' : js,
                'relative.js' : relative,
            }
        };

        return runCompile(entry, opts)
        .then((result) => {
            const actual = result.code;
            //console.log(actual);
            const expected = fs.readFileSync(path.join(fixturesDir, 'expected-relative-import.js'));
            assert.equal(trim(actual), trim(expected));
        })
    });

});

function runCompile(filePath, options = {}) {
    const config = Object.assign({}, BASE_CONFIG, options);
    return compile(filePath, config);
}


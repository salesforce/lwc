/* eslint-env node, mocha */
import * as fs from 'fs';
import * as path from 'path';

import assert from 'power-assert';
import { compile, compileResource } from '../src/index';

function trim(str) {
    return str.toString().replace(/^\s+|\s+$/, '');
}

const BASE_CONFIG = {};
const skipTests = [
    '.babelrc',
    '.DS_Store',
];

const fixturesDir = path.join(__dirname, 'fixtures');


describe('compile individual resources: ', () => {
    it('compile with no options - no namespace', () => {
        const htmlFile = path.join(fixturesDir, 'class_and_template/class_and_template.html');
        const expected = fs.readFileSync(path.join(fixturesDir, 'expected-template.js'));
        const result = compileResource(htmlFile, {});
        assert.equal(trim(expected), trim(result.code));
    });
});

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
            const expected = fs.readFileSync(path.join(fixturesDir, 'expected-no-options.js'));
            assert.equal(trim(expected), trim(actual));
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
            const expected = fs.readFileSync(path.join(fixturesDir, 'expected-no-options-unknown-ns.js'));
            assert.equal(trim(expected), trim(actual));
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
            const expected = fs.readFileSync(path.join(fixturesDir, 'expected-mapped-ns1.js'));
            assert.equal(trim(expected), trim(actual));
        })
    });
});

describe('emit asserts for embedded sources: ', () => {
    it('Compile using sources', () => {
        const html = fs.readFileSync(path.join(fixturesDir, 'class_and_template/class_and_template.html')).toString();
        const js = fs.readFileSync(path.join(fixturesDir, 'class_and_template/class_and_template.js')).toString();
        const entry = '/customNs/class_and_template/class_and_template.js';

        const opts = {
            sources: {
                '/customNs/class_and_template/class_and_template.js': js,
                '/customNs/class_and_template/class_and_template.html' : html
            },
            mapNamespaceFromPath: true
        };

        return runCompile(entry, opts)
        .then((result) => {
            const actual = result.code;
            //console.log(actual);
            const expected = fs.readFileSync(path.join(fixturesDir, 'expected-sources-namespaced.js'));
            assert.equal(trim(expected), trim(actual));
        })
    });

    it('Compile using sources and format', () => {
        const html = fs.readFileSync(path.join(fixturesDir, 'class_and_template/class_and_template.html')).toString();
        const js = fs.readFileSync(path.join(fixturesDir, 'class_and_template/class_and_template.js')).toString();
        const entry = 'myns/class_and_template/class_and_template.js';

        const opts = {
            sources: {
                'myns/class_and_template/class_and_template.js': js,
                'myns/class_and_template/class_and_template.html': html,
            },
            mapNamespaceFromPath: true,
            format: 'amd',
        };

        return runCompile(entry, opts)
        .then((result) => {
            const actual = result.code;
            //console.log(actual);
            const expected = fs.readFileSync(path.join(fixturesDir, 'expected-sources-namespaced-format.js'));
            assert.equal(trim(expected), trim(actual));
        })
    });

    it('Compile using folder sources and format', () => {
        const html = fs.readFileSync(path.join(fixturesDir, 'relative_import/relative_import.html')).toString();
        const js = fs.readFileSync(path.join(fixturesDir, 'relative_import/relative_import.js')).toString();
        const rel = fs.readFileSync(path.join(fixturesDir, 'relative_import/relative.js')).toString();
        const rel2 = fs.readFileSync(path.join(fixturesDir, 'relative_import/other/relative2.js')).toString();
        const rel3 = fs.readFileSync(path.join(fixturesDir, 'relative_import/other/relative3.js')).toString();

        const entry = 'myns/relative_import/relative_import.js';

        const opts = {
            mapNamespaceFromPath: true,
            format: 'amd',
            sources: {
                'myns/relative_import/relative_import.html': html,
                'myns/relative_import/relative_import.js' : js,
                'myns/relative_import/relative.js' : rel,
                'myns/relative_import/other/relative2.js' : rel2,
                'myns/relative_import/other/relative3.js' : rel3
            }
        };

        return runCompile(entry, opts)
        .then((result) => {
            const actual = result.code;
            //console.log(actual);
            const expected = fs.readFileSync(path.join(fixturesDir, 'expected-relative-import.js'));
            assert.equal(trim(expected), trim(actual));
        })
    });
});

describe('emit asserts for modes: ', () => {
    const fixtureCmpDir = path.join(fixturesDir, 'class_and_template');
    it('Test prod mode', () => {
        const entry = path.join(fixtureCmpDir, 'class_and_template.js');
        const opts = {
            format : 'amd',
            mode   : 'prod',
        };

        return runCompile(entry, opts).then((result) => {
            const actual = result.code;
            //console.log('>>', actual);
            const expected = fs.readFileSync(path.join(fixturesDir, 'expected-prod-mode.js'));
            assert.equal(trim(expected), trim(actual));
        });
    });

     it('Test compat mode', () => {
        const entry = path.join(fixtureCmpDir, 'class_and_template.js');
        const opts = {
            format : 'amd',
            mode   : 'compat',
        };

        return runCompile(entry, opts).then((result) => {
            const actual = result.code;
            //console.log('>>', actual);
            const expected = fs.readFileSync(path.join(fixturesDir, 'expected-compat-mode.js'));
            assert.equal(trim(expected), trim(actual));
        });
    });


    it('Test all mode', () => {
        const entry = path.join(fixtureCmpDir, 'class_and_template.js');
        const opts = {
            format : 'amd',
            mode   : 'all',
        };

        return runCompile(entry, opts).then((result) => {
            const actual = Object.keys(result);
            const expected = ['dev', 'prod', 'compat'];
            assert.deepStrictEqual(actual, expected);
        });
    });
 });

function runCompile(filePath, options = {}) {
    const config = Object.assign({}, BASE_CONFIG, options);
    return compile(filePath, config);
}


/* eslint-env mocha, node */

import * as babel from 'babel-core';
import * as fs from 'fs';
import * as path from 'path';

import assert from 'power-assert';
import plugin from '../src/index';

const FIXTURE_DIR = path.join(__dirname, 'fixtures');

function trim(str) {
    return str.toString().replace(/^\s+|\s+$/, '');
}

function isOnly(dir) {
    return fs.existsSync(path.join(dir, 'only'));
}

function transform(filePath, options = {}) {
    function getPluginConfig() {
        return [plugin, options];
    }

    return babel.transformFileSync(filePath, {
        babelrc: false,
        plugins: [getPluginConfig()],
    }).code;
}


function generateTestCase(dir, name) {
    (isOnly(dir) ? it.only : it)(name, () => {
        try {
            const actual = transform(path.join(dir, 'actual.html'));

            // Check code output
            const expected = fs.readFileSync(path.join(dir, 'expected.js'));
            assert.equal(trim(actual), trim(expected));   
        } catch (error) {
            try {
                const expected = JSON.parse(fs.readFileSync(path.join(dir, 'error.json')));

                const messageContent = error.message.slice(error.message.indexOf(':') + 2); 
                assert.equal(messageContent, expected.message, 'Messages are not matching');
                assert(error.loc.line == expected.line, `Error lines are not matching`);
                assert(error.loc.column == expected.column, `Error columns are not matching`);
            } catch (missingError) {
                if (missingError.message.includes('ENOENT')) {
                    throw error;
                }

                throw missingError;
            }
        }
    });
}

describe('fixtures', () => {
    fs.readdirSync(FIXTURE_DIR).map((caseName) => {
        const fixtureDir = path.join(FIXTURE_DIR, caseName);
        if (!fs.statSync(fixtureDir).isDirectory()) {
            return;
        }

        generateTestCase(fixtureDir, caseName);
    });
});

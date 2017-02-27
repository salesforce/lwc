import * as babel from 'babel-core';
import * as fs from 'fs';
import * as path from 'path';

import assert from 'power-assert';

function trim(str) {
    return str.toString().replace(/^\s+|\s+$/, '');
}

function isOnly(dir) {
    return fs.existsSync(path.join(dir, 'only'));
}

function transform(filePath, options) {
    const {
        plugins = [],
        parserOpts
    } = options;

    return babel.transformFileSync(filePath, {
        babelrc: false,
        plugins,
        parserOpts
    }).code;
}

function generateTestCase(dir, name, babelOpts) {
    const {
        actualFileExtension = 'js'
    } = babelOpts;

    const actualPath = path.join(dir, `actual.${actualFileExtension}`);
    const expectedPath = path.join(dir, 'expected.js');
    const errorPath = path.join(dir, 'error.json');

    (isOnly(dir) ? it.only : it)(name, () => {
        try {
            const actual = transform(actualPath, babelOpts);

            // Check code output
            const expected = fs.readFileSync(expectedPath);
            assert.equal(trim(actual), trim(expected));
        } catch (error) {
            try {
                const expected = JSON.parse(fs.readFileSync(errorPath));

                // Check the errror
                const messageContent = error.message.slice(error.message.indexOf(':') + 2);
                assert.equal(messageContent, expected.message, 'Messages are not matching');
                assert.equal(error.loc.line, expected.line, 'Error lines are not matching');
                assert.equal(error.loc.column, expected.column, 'Error columns are not matching');
            } catch (errrorError) {
                // Throw the original error is the error file is not present
                if (errrorError.message.includes('ENOENT')) {
                    throw error;
                }

                // Throw the error "comparison error""
                throw errrorError;
            }
        }
    });
}

export function babelFixtureTransform (dir, babelOpts) {
    describe('fixtures', () => {
        fs.readdirSync(dir).map(name => {
            const fixtureDir = path.join(dir, name);

            // Keep only directories in the fixture dir
            if (!fs.statSync(fixtureDir).isDirectory()) {
                return;
            }

            generateTestCase(fixtureDir, name, babelOpts);
        });
    });
}

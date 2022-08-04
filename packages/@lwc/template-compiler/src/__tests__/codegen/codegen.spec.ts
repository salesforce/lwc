/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import fs from 'fs';
import path from 'path';
import generate from '../../codegen';
import parseTemplate from '../../parser';
import { normalizeConfig } from '../../config';
import State from '../../state';

const TEST_DIRECTORIES = [
    {
        input: './fixtures/simple/input.html',
        json: './fixtures/simple/input.json',
        output: './fixtures/simple/expected.js',
    },
    {
        input: './fixtures/if-else-if-else/input.html',
        json: './fixtures/if-else-if-else/input.json',
        output: './fixtures/if-else-if-else/expected.js',
    },
    {
        input: './fixtures/if/input.html',
        json: './fixtures/if/input.json',
        output: './fixtures/if/expected.js',
    },
];

const MODIFIED_AST_DIRECTORIES = [
    {
        input: './fixtures/for-if-simple/input.html',
        json: './fixtures/for-if-simple/input.json',
        output: './fixtures/for-if-simple/expected.js',
    },
];

describe('codegen', () => {
    it('set up ast', () => {
        TEST_DIRECTORIES.forEach((directory) => {
            const input = fs.readFileSync(path.resolve(__dirname, directory.input), 'utf-8');
            const config = normalizeConfig({});
            const state = new State(config);
            const ast = parseTemplate(input, state);
            const code = generate(ast.root!, state);

            // write json files
            fs.writeFileSync(path.resolve(__dirname, directory.json), JSON.stringify(ast, null, 4));
            fs.writeFileSync(path.resolve(__dirname, directory.output), code);
        });
    });

    it('setup modified ast', () => {
        MODIFIED_AST_DIRECTORIES.forEach((directory) => {
            const input = fs.readFileSync(path.resolve(__dirname, directory.json), 'utf-8');
            const config = normalizeConfig({});
            const state = new State(config);
            const code = generate(JSON.parse(input).root!, state);
            fs.writeFileSync(path.resolve(__dirname, directory.output), code);
        });
    });
});

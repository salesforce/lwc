/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { compile } from '../index';
import { pretify, readFixture } from './utils';

const BASE_CONFIG = {
    outputConfig: {
        minify: false,
        compat: false,
        format: 'amd',
    },
    name: 'node_env',
    namespace: 'x',
    files: {
        'node_env.js': readFixture('./node_env/node_env.js'),
        'node_env.html': readFixture('./node_env/node_env.html'),
    },
};

describe('test shape of the bundle in different modes and environments', () => {
    test('test bundle with NODE_ENV set to dev', async () => {
        const customConfig = {
            outputConfig: {
                format: 'es',
                env: {
                    NODE_ENV: 'development',
                },
            },
        };
        const config = Object.assign({}, BASE_CONFIG, customConfig);
        const {
            result: { code },
        } = await compile(config);
        expect(pretify(code)).toBe(pretify(readFixture('expected-node-env-dev.js')));
    });

    test('test bundle with NODE_ENV set to production', async () => {
        const customConfig = {
            outputConfig: {
                format: 'es',
                env: {
                    NODE_ENV: 'production',
                },
            },
        };
        const config = Object.assign({}, BASE_CONFIG, customConfig);
        const {
            result: { code },
        } = await compile(config);
        expect(pretify(code)).toBe(pretify(readFixture('expected-node-env-prod.js')));
    });

    test('test bundle for production in compat', async () => {
        const customConfig = {
            outputConfig: {
                compat: true,
                minify: true,
                env: { NODE_ENV: 'production' },
            },
        };
        const config = Object.assign({}, BASE_CONFIG, customConfig);
        const {
            result: { code },
        } = await compile(config);
        expect(pretify(code)).toBe(pretify(readFixture('expected-prod_compat-mode.js')));
    });

    test('test bundle in prod mode', async () => {
        const customConfig = {
            name: 'class_and_template',
            files: {
                'class_and_template.js': readFixture('./class_and_template/class_and_template.js'),
                'class_and_template.html': readFixture(
                    './class_and_template/class_and_template.html'
                ),
            },
            outputConfig: {
                minify: true,
            },
        };
        const config = Object.assign({}, BASE_CONFIG, customConfig);
        const {
            result: { code },
        } = await compile(config);
        expect(pretify(code)).toBe(pretify(readFixture('expected-prod-mode.js')));
    });

    test('test minified bundles to remove comments', async () => {
        const minifiedConfig = {
            name: 'comments',
            files: {
                'comments.js': readFixture('./comments/comments.js'),
                'comments.html': readFixture('./comments/comments.html'),
                'comments.css': readFixture('./comments/comments.css'),
            },
            outputConfig: {
                minify: true,
            },
        };
        const config = Object.assign({}, BASE_CONFIG, minifiedConfig);
        const {
            result: { code },
        } = await compile(config);
        expect(pretify(code)).toBe(pretify(readFixture('expected-minify-no-comments.js')));
    });
});

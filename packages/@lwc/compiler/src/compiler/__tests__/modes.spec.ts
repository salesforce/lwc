/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { compile } from '../../index';

const NODE_ENV_SOURCE = `
if (process.env.NODE_ENV === 'production') {
    console.log('I am in prod');
} else if (process.env.NODE_ENV === 'development') {
    console.log('I am in dev');
}
`;

function getConfig(env = {}) {
    return {
        name: 'node_env',
        namespace: 'x',
        files: {
            'node_env.js': NODE_ENV_SOURCE,
        },
        outputConfig: { format: 'es', env },
    };
}

describe('environment replacement', function () {
    it('should not replace environment variable if unset', async () => {
        const {
            result: { code },
        } = await compile(getConfig());

        expect(code).toContain('process.env.NODE_ENV');
    });

    it('should replace environment variable if set', async () => {
        const {
            result: { code },
        } = await compile(
            getConfig({
                NODE_ENV: 'development',
            })
        );

        expect(code).not.toContain('process.env.NODE_ENV');
    });

    it('should strip branch when the condition is evaluated to false', async () => {
        const {
            result: { code },
        } = await compile(
            getConfig({
                NODE_ENV: 'production',
            })
        );

        expect(code).toContain('I am in prod');
        expect(code).not.toContain('I am in dev');
    });
});

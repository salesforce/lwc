/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { Plugin } from 'rollup';
import rollupPluginReplace from '@rollup/plugin-replace';

import { NormalizedCompileOptions } from '../options';

export default function ({ options }: { options: NormalizedCompileOptions }): Plugin {
    const { env } = options.outputConfig;

    const patterns: { [pattern: string]: string } = {};
    if (env.NODE_ENV) {
        // Use JSON.stringify to add wrapping quotes around the env.NODE_ENV value. The
        // @rollup/plugin-replace is doing a simple search and replace in the code, the wrapping
        // quote are necessary other it will produce an identifier instead of a string.
        patterns[`process.env.NODE_ENV`] = JSON.stringify(env.NODE_ENV);
    }

    return rollupPluginReplace({
        values: patterns,
    });
}

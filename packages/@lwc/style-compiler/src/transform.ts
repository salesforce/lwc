/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import postcss from 'postcss';

import serialize from './serialize';
import postcssLwc from './postcss-lwc-plugin';
import postcssMinify from './postcss-minify-plugins';

export interface Config {
    /** CSS custom properties configuration */
    customProperties?: {
        /** Disallow definition of CSS custom properties when set to false */
        allowDefinition?: boolean;

        /** Name of the module to resolve custom properties lookup */
        resolverModule?: string;
    };

    outputConfig?: {
        /** Apply minification to the generated code */
        minify?: boolean;
    };
}

export function transform(src: string, id: string, config: Config = {}): { code: string } {
    if (src === '') {
        return { code: 'export default undefined' };
    }

    const allowDefinition = !config.customProperties || config.customProperties.allowDefinition;
    const collectVarFunctions = Boolean(
        config.customProperties && config.customProperties.resolverModule
    );
    const minify = config.outputConfig && config.outputConfig.minify;

    let plugins = [
        postcssLwc({
            customProperties: {
                allowDefinition,
                collectVarFunctions,
            },
        }),
    ];

    if (minify) {
        // We are unshifting to ensure minification runs before lwc
        // This is important because we clone declarations that can't be mangled by the minifier.
        plugins = [...postcssMinify, ...plugins];
    }

    const result = postcss(plugins).process(src, { from: id });

    return { code: serialize(result, config) };
}

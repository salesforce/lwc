/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import postcss from 'postcss';

import serialize from './serialize';
import postcssLwc from './postcss-lwc-plugin';

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

    const allowDefinition = config.customProperties?.allowDefinition ?? false;
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
        const postcssMinify = require('./postcss-minify-plugins').default;
        // It's important to run the postcss minification plugins before the LWC one because we
        // need to clone the CSS declarations and they shouldn't be mangled by the minifier.
        plugins = [...postcssMinify(), ...plugins];
    }

    const result = postcss(plugins).process(src, { from: id }).sync();

    return { code: serialize(result, config) };
}

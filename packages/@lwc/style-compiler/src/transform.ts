/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import postcss from 'postcss';
import { getAPIVersionFromNumber } from '@lwc/shared';

import serialize from './serialize';
import postcssLwc from './postcss-lwc-plugin';

export interface Config {
    /** CSS custom properties configuration */
    customProperties?: {
        /** Name of the module to resolve custom properties lookup */
        resolverModule?: string;
    };
    /** Token that is used for scoping in light DOM scoped styles */
    scoped?: boolean;
    /** When set to true, synthetic shadow DOM support is removed from the output JavaScript */
    disableSyntheticShadowSupport?: boolean;
    apiVersion?: number;
}

export function transform(src: string, id: string, config: Config = {}): { code: string } {
    if (src === '') {
        return { code: 'export default undefined' };
    }

    const scoped = !!config.scoped;
    const apiVersion = getAPIVersionFromNumber(config.apiVersion);

    const plugins = [postcssLwc({ scoped, apiVersion })];

    const result = postcss(plugins).process(src, { from: id }).sync();

    return { code: serialize(result, config) };
}

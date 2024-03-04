/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import postcss from 'postcss';
import { getAPIVersionFromNumber } from '@lwc/shared';

import serialize from './serialize';
import postcssLwc from './postcss-lwc-plugin';

/** Configuration options for CSS transforms. */
export interface Config {
    /**
     * CSS custom properties configuration
     * @deprecated Custom property transforms are deprecated because IE11 and other legacy browsers are no longer supported.
     */
    // TODO [#3266]: Remove StylesheetConfig as part of breaking change wishlist
    customProperties?: {
        /** Name of the module to resolve custom properties lookup */
        resolverModule?: string;
    };
    /** Token that is used for scoping in light DOM scoped styles */
    scoped?: boolean;
    /** When set to true, synthetic shadow DOM support is removed from the output JavaScript */
    disableSyntheticShadowSupport?: boolean;
    /** The API version to associate with the compiled stylesheet */
    apiVersion?: number;
}

/**
 * Transforms CSS for use with LWC components.
 * @param src Contents of the CSS source file
 * @param id Filename of the CSS source file
 * @param config Transformation options
 * @returns Transformed CSS
 * @example
 * const {transform} = require('@lwc/style-compiler');
 * const source = `
 *  :host {
 *    opacity: 0.4;
 *  }
 *  span {
 *    text-transform: uppercase;
 *  }`;
 * const { code } = transform(source, 'example.css');
 */
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

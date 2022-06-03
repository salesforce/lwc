/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { NormalizedConfig } from './config';

export default class State {
    config: NormalizedConfig;

    /**
     * For a fast look up for elements that need a custom renderer
     */
    elementsReqCustomRenderer: { [tagName: string]: Set<string> };

    directivesReqCustomRenderer: Set<string>;

    constructor(config: NormalizedConfig) {
        this.config = config;
        this.elementsReqCustomRenderer = config.customRendererConfig.elements.reduce(
            (acc: { [tagName: string]: Set<string> }, e) => {
                acc[e.tagName] = new Set(e.attributes ?? []);
                return acc;
            },
            {}
        );
        this.directivesReqCustomRenderer = new Set(config.customRendererConfig.directives);
    }
}

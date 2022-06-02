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
     * For a fast look up for risky elements that need sanitization hooks
     */
    riskyElements: { [tagName: string]: Set<string> };

    riskyDirectives: Set<string>;

    constructor(config: NormalizedConfig) {
        this.config = config;
        this.riskyElements = config.sanitizeConfig.elements.reduce(
            (acc: { [tagName: string]: Set<string> }, e) => {
                acc[e.tagName] = new Set(e.attributes ?? []);
                return acc;
            },
            {}
        );
        this.riskyDirectives = new Set(config.sanitizeConfig.directives);
    }
}

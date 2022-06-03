/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { NormalizedConfig } from './config';
import { CustomRendererElementConfig } from './shared/renderer-hooks';

export default class State {
    config: NormalizedConfig;

    /**
     * For a fast look up for elements that need a custom renderer
     */
    elementsReqCustomRenderer: { [tagName: string]: CustomRendererElementConfig };

    directivesReqCustomRenderer: Set<string>;

    constructor(config: NormalizedConfig) {
        this.config = config;
        this.elementsReqCustomRenderer = config.customRendererConfig
            ? Object.fromEntries(
                  config.customRendererConfig.elements.map((element) => [element.tagName, element])
              )
            : {};
        this.directivesReqCustomRenderer = new Set(config.customRendererConfig?.directives);
    }
}

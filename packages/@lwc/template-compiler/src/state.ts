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
     * Look up custom renderer config by tag name.
     */
    crElmToConfigMap: {
        [tagName: string]: { namespace: string | undefined; attributes: Set<string> };
    };
    /**
     * Look up for directives that require custom renderer
     */
    crDirectives: Set<string>;

    constructor(config: NormalizedConfig) {
        this.config = config;
        this.crElmToConfigMap = config.customRendererConfig
            ? Object.fromEntries(
                  config.customRendererConfig.elements.map((element) => {
                      const { tagName, attributes, namespace } = element;
                      return [tagName, { namespace, attributes: new Set(attributes) }];
                  })
              )
            : {};
        this.crDirectives = new Set(config.customRendererConfig?.directives);
    }
}

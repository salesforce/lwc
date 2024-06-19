/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { BaseElement } from './shared/types';
import { generateScopeTokens, type scopeTokens } from './scopeTokens';
import type { NormalizedConfig } from './config';

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

    /**
     * Cache the result of elements that have already been checked if they require custom renderer
     */
    crCheckedElements: Map<BaseElement, boolean>;

    /**
     * Filename of the HTML source
     */
    filename: string;

    /**
     * Contains the scopeTokens used in the template metadata
     */
    scopeTokens: scopeTokens;

    constructor(config: NormalizedConfig, filename: string) {
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
        this.crCheckedElements = new Map<BaseElement, boolean>();
        this.filename = filename;
        this.scopeTokens = generateScopeTokens(filename, config.namespace, config.name);
    }
}

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { ResolvedConfig } from './config';

export default class State {
    config: ResolvedConfig;

    /**
     * This flag indicates if a the generated code should scope the template fragment id. It is set
     * to true if the template also contains ids.
     *
     * TODO [#1150]: Remove this code once we can figure out how to do this in a deterministic
     * fashion.
     */
    shouldScopeFragmentId: boolean = false;

    constructor(config: ResolvedConfig) {
        this.config = config;
    }
}

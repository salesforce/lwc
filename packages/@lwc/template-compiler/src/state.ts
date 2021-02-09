/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { MarkupData } from 'parse5-with-errors';

import { ResolvedConfig } from './config';

export interface IdAttributeData {
    location: MarkupData.Location;
    value: string;
}
export default class State {
    code: string;
    config: ResolvedConfig;

    ids: string[] = [];
    slots: string[] = [];
    dependencies: string[] = [];
    secureDependencies: string[] = []; // imports patched by locker service at runtime

    idAttrData: IdAttributeData[] = [];

    /**
     * This flag indicates if a the generated code should scope the template fragment id. It is set
     * to true if the template also contains ids.
     *
     * TODO [#1150]: Remove this code once we can figure out how to do this in a deterministic
     * fashion.
     */
    shouldScopeFragmentId: boolean = false;

    constructor(code: string, config: ResolvedConfig) {
        this.code = code;
        this.config = config;
    }
}

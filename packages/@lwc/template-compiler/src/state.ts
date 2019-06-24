/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { MarkupData } from 'parse5-with-errors';

import { ResolvedConfig } from './config';
import { Statement, ImportDeclaration } from '@babel/types';

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

    inlineStyle: {
        body: Statement[];
        imports: ImportDeclaration[];
    } = {
        body: [],
        imports: [],
    };

    idAttrData: IdAttributeData[] = [];

    constructor(code: string, config: ResolvedConfig) {
        this.code = code;
        this.config = config;
    }
}

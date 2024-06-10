/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { LightningElement } from 'lwc';
import unscoped from './stylesheet.css';
import scoped from './stylesheet.scoped.css';

type StylesheetFactory = (
    stylesheetToken: string | undefined,
    useActualHostSelector: boolean,
    useNativeDirPseudoclass: boolean
) => string;
export type TemplateStylesheetFactories = Array<StylesheetFactory | TemplateStylesheetFactories>;

// --- valid usage --- //

export class EmptyArray extends LightningElement {
    static stylesheets = [];
}

export class Stylesheets extends LightningElement {
    static stylesheets = [scoped, unscoped];
}

// --- invalid usage --- //

// @ts-expect-error cannot be undefined
export class Undefined extends LightningElement {
    static stylesheets = undefined;
}

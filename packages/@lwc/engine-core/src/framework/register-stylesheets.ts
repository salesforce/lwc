/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined } from '@lwc/shared';
import { Template } from './template';
import { TemplateStylesheetFactories } from './stylesheet';
import { flattenStylesheets } from './utils';
import { checkVersionMismatch } from './check-version-mismatch';

function checkStylesheetsVersionMismatch(stylesheets: TemplateStylesheetFactories | undefined) {
    if (!isUndefined(stylesheets)) {
        for (const stylesheet of flattenStylesheets(stylesheets)) {
            checkVersionMismatch(stylesheet, 'stylesheet');
        }
    }
}

export function registerStylesheets(
    tmpl: Template,
    stylesheetToken: string,
    ...stylesheets: Array<TemplateStylesheetFactories | undefined>,
) {
    if (process.env.NODE_ENV !== 'production') {
        checkStylesheetsVersionMismatch(stylesheets);
        checkStylesheetsVersionMismatch(scopedStylesheets);
    }
    tmpl.stylesheetToken = stylesheetToken;
    tmpl.stylesheets = [];
    if (!isUndefined(stylesheets)) {
        tmpl.stylesheets.push(...stylesheets);
    }
    if (!isUndefined(scopedStylesheets)) {
        tmpl.stylesheets.push(...scopedStylesheets);
    }
}

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ArrayPush, isUndefined } from '@lwc/shared';
import { Template } from './template';
import { TemplateStylesheetFactories } from './stylesheet';
import { flattenStylesheets } from './utils';
import { checkVersionMismatch } from './check-version-mismatch';

export function registerStylesheets(
    tmpl: Template,
    stylesheetToken: string,
    ...stylesheetLists: Array<TemplateStylesheetFactories | undefined>
) {
    tmpl.stylesheetToken = stylesheetToken;
    tmpl.stylesheets = [];
    for (const stylesheets of stylesheetLists) {
        if (!isUndefined(stylesheets)) {
            ArrayPush.apply(tmpl.stylesheets, stylesheets);
        }
    }
    if (process.env.NODE_ENV !== 'production') {
        for (const stylesheet of flattenStylesheets(tmpl.stylesheets)) {
            checkVersionMismatch(stylesheet, 'stylesheet');
        }
    }
}

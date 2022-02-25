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

export function registerStylesheets(
    tmpl: Template,
    stylesheetToken: string,
    ...stylesheets: Array<TemplateStylesheetFactories | undefined>
) {
    tmpl.stylesheetToken = stylesheetToken;
    tmpl.stylesheets = stylesheets.filter(
        (stylesheet) => !isUndefined(stylesheet)
    ) as TemplateStylesheetFactories;
    if (process.env.NODE_ENV !== 'production') {
        for (const stylesheet of flattenStylesheets(tmpl.stylesheets)) {
            checkVersionMismatch(stylesheet, 'stylesheet');
        }
    }
}

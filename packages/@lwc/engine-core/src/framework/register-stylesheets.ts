/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    ArrayPush,
    isUndefined,
    ArrayPop,
    ArrayShift,
    ArrayUnshift,
    ArrayReverse,
    ArraySort,
    ArrayFill,
    ArraySplice,
    ArrayCopyWithin,
} from '@lwc/shared';
import { logError } from '../shared/logger';
import { Template } from './template';
import { TemplateStylesheetFactories } from './stylesheet';
import { flattenStylesheets } from './utils';
import { checkVersionMismatch } from './check-version-mismatch';
import { setTemplateMutationWarningsSilenced } from './secure-template';

// Via https://www.npmjs.com/package/object-observer
const ARRAY_MUTATION_METHODS = [
    'pop',
    'push',
    'shift',
    'unshift',
    'reverse',
    'sort',
    'fill',
    'splice',
    'copyWithin',
] as const;

function getOriginalArrayMethod(prop: typeof ARRAY_MUTATION_METHODS[number]) {
    switch (prop) {
        case 'pop':
            return ArrayPop;
        case 'push':
            return ArrayPush;
        case 'shift':
            return ArrayShift;
        case 'unshift':
            return ArrayUnshift;
        case 'reverse':
            return ArrayReverse;
        case 'sort':
            return ArraySort;
        case 'fill':
            return ArrayFill;
        case 'splice':
            return ArraySplice;
        case 'copyWithin':
            return ArrayCopyWithin;
    }
}

// Warn if the user tries to mutate tmpl.stylesheets, e.g.:
// `tmpl.stylesheets.push(someStylesheetFunction)`
function warnOnArrayMutation(stylesheets: TemplateStylesheetFactories) {
    // We can't handle users calling Array.prototype.slice.call(tmpl.stylesheets), but
    // we can at least warn when they use the most common mutation methods.
    for (const prop of ARRAY_MUTATION_METHODS) {
        const originalArrayMethod = getOriginalArrayMethod(prop);
        stylesheets[prop] = function arrayMutationWarningWrapper() {
            logError(
                `Mutating the "stylesheets" array on a template function ` +
                    `is deprecated and may be removed in a future version of LWC.`
            );
            // @ts-ignore
            return originalArrayMethod.apply(this, arguments);
        };
    }
}

export function registerStylesheets(
    tmpl: Template,
    stylesheetToken: string,
    ...stylesheetLists: Array<TemplateStylesheetFactories | undefined>
) {
    const tmplStylesheets: TemplateStylesheetFactories = [];
    for (const stylesheets of stylesheetLists) {
        if (!isUndefined(stylesheets)) {
            ArrayPush.apply(tmplStylesheets, stylesheets);
        }
    }

    if (process.env.NODE_ENV !== 'production') {
        warnOnArrayMutation(tmplStylesheets);
    }

    // Don't warn on setting the stylesheetToken / stylesheet if the engine is doing the setting
    setTemplateMutationWarningsSilenced(true);
    try {
        tmpl.stylesheetToken = stylesheetToken;
        tmpl.stylesheets = tmplStylesheets;
    } finally {
        setTemplateMutationWarningsSilenced(false);
    }

    if (process.env.NODE_ENV !== 'production') {
        for (const stylesheet of flattenStylesheets(tmpl.stylesheets)) {
            checkVersionMismatch(stylesheet, 'stylesheet');
        }
    }
}

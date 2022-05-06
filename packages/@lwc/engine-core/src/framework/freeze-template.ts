/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    ArrayPush,
    ArraySplice,
    ArrayUnshift,
    ArrayCopyWithin,
    ArrayFill,
    ArrayPop,
    ArrayShift,
    ArraySort,
    ArrayReverse,
    defineProperty,
    getOwnPropertyDescriptor,
    isUndefined,
} from '@lwc/shared';
import { logError } from '../shared/logger';
import { Template } from './template';
import { TemplateStylesheetFactories } from './stylesheet';

// See @lwc/engine-core/src/framework/template.ts
const TEMPLATE_PROPS = ['slots', 'stylesheetToken', 'stylesheets', 'renderMode'] as const;

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

let mutationWarningsSilenced = false;

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

// TODO [#2782]: eventually freezeTemplate() will _actually_ freeze the tmpl object. Today it
// just warns on mutation.
export function freezeTemplate(tmpl: Template) {
    if (process.env.NODE_ENV !== 'production') {
        if (!isUndefined(tmpl.stylesheets)) {
            warnOnArrayMutation(tmpl.stylesheets);
        }
        for (const prop of TEMPLATE_PROPS) {
            let value = tmpl[prop];
            defineProperty(tmpl, prop, {
                enumerable: true,
                configurable: true,
                get() {
                    return value;
                },
                set(newValue) {
                    if (!mutationWarningsSilenced) {
                        logError(
                            `Dynamically setting the "${prop}" property on a template function ` +
                                `is deprecated and may be removed in a future version of LWC.`
                        );
                    }
                    value = newValue;
                },
            });
        }

        const originalDescriptor = getOwnPropertyDescriptor(tmpl, 'stylesheetTokens');
        defineProperty(tmpl, 'stylesheetTokens', {
            enumerable: true,
            configurable: true,
            get: originalDescriptor!.get,
            set(value) {
                logError(
                    `Dynamically setting the "stylesheetTokens" property on a template function ` +
                        `is deprecated and may be removed in a future version of LWC.`
                );
                // Avoid logging twice (for both stylesheetToken and stylesheetTokens)
                mutationWarningsSilenced = true;
                originalDescriptor!.set!.call(this, value);
                mutationWarningsSilenced = false;
            },
        });
    }
}

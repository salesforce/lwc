/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    ArrayCopyWithin,
    ArrayFill,
    ArrayPop,
    ArrayPush,
    ArrayReverse,
    ArrayShift,
    ArraySort,
    ArraySplice,
    ArrayUnshift,
    defineProperty,
    freeze,
    getOwnPropertyDescriptor,
    isArray,
    isUndefined,
} from '@lwc/shared';
import { logWarnOnce } from '../shared/logger';
import { Template } from './template';
import { StylesheetFactory, TemplateStylesheetFactories } from './stylesheet';
import { onReportingEnabled, report, ReportingEventId } from './reporting';

// See @lwc/engine-core/src/framework/template.ts
const TEMPLATE_PROPS = ['slots', 'stylesheetToken', 'stylesheets', 'renderMode'] as const;

// Expandos that may be placed on a stylesheet factory function, and which are meaningful to LWC at runtime
const STYLESHEET_PROPS = [
    // SEE `KEY__SCOPED_CSS` in @lwc/style-compiler
    '$scoped$',
] as const;

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

let mutationTrackingDisabled = false;

function getOriginalArrayMethod(prop: (typeof ARRAY_MUTATION_METHODS)[number]) {
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

// stylesheetTokens is a legacy prop
type TemplateProp = (typeof TEMPLATE_PROPS)[number] | 'stylesheetTokens';
type StylesheetProp = (typeof STYLESHEET_PROPS)[number];

function reportViolation(
    type: 'template',
    eventId: ReportingEventId.TemplateMutation,
    prop: TemplateProp
): void;
function reportViolation(
    type: 'stylesheet',
    eventId: ReportingEventId.StylesheetMutation,
    prop: StylesheetProp
): void;
function reportViolation(
    type: 'template' | 'stylesheet',
    eventId: ReportingEventId.TemplateMutation | ReportingEventId.StylesheetMutation,
    prop: TemplateProp | StylesheetProp
): void {
    if (process.env.NODE_ENV !== 'production') {
        logWarnOnce(
            `Mutating the "${prop}" property on a ${type} ` +
                `is deprecated and will be removed in a future version of LWC. ` +
                `See: https://sfdc.co/template-mutation`
        );
    }
    report(eventId, { propertyName: prop });
}

function reportTemplateViolation(prop: TemplateProp) {
    reportViolation('template', ReportingEventId.TemplateMutation, prop);
}

function reportStylesheetViolation(prop: StylesheetProp) {
    reportViolation('stylesheet', ReportingEventId.StylesheetMutation, prop);
}

// Warn if the user tries to mutate a stylesheets array, e.g.:
// `tmpl.stylesheets.push(someStylesheetFunction)`
function warnOnArrayMutation(stylesheets: TemplateStylesheetFactories) {
    // We can't handle users calling Array.prototype.slice.call(tmpl.stylesheets), but
    // we can at least warn when they use the most common mutation methods.
    for (const prop of ARRAY_MUTATION_METHODS) {
        const originalArrayMethod = getOriginalArrayMethod(prop);
        stylesheets[prop] = function arrayMutationWarningWrapper() {
            reportTemplateViolation('stylesheets');
            // @ts-ignore
            return originalArrayMethod.apply(this, arguments);
        };
    }
}

// Warn if the user tries to mutate a stylesheet factory function, e.g.:
// `stylesheet.$scoped$ = true`
function warnOnStylesheetFunctionMutation(stylesheet: StylesheetFactory) {
    for (const prop of STYLESHEET_PROPS) {
        let value = (stylesheet as any)[prop];
        defineProperty(stylesheet, prop, {
            enumerable: true,
            configurable: true,
            get() {
                return value;
            },
            set(newValue) {
                reportStylesheetViolation(prop);
                value = newValue;
            },
        });
    }
}

// Warn on either array or stylesheet (function) mutation, in a deeply-nested array
function trackStylesheetsMutation(stylesheets: TemplateStylesheetFactories) {
    traverseStylesheets(stylesheets, (subStylesheets) => {
        if (isArray(subStylesheets)) {
            warnOnArrayMutation(subStylesheets);
        } else {
            warnOnStylesheetFunctionMutation(subStylesheets);
        }
    });
}

// Deeply freeze the entire array (of arrays) of stylesheet factory functions
function deepFreeze(stylesheets: TemplateStylesheetFactories) {
    traverseStylesheets(stylesheets, (subStylesheets) => {
        freeze(subStylesheets);
    });
}

// Deep-traverse an array (of arrays) of stylesheet factory functions, and call the callback for every array/function
function traverseStylesheets(
    stylesheets: TemplateStylesheetFactories,
    callback: (subStylesheets: TemplateStylesheetFactories | StylesheetFactory) => void
) {
    callback(stylesheets);
    for (let i = 0; i < stylesheets.length; i++) {
        const stylesheet = stylesheets[i];
        if (isArray(stylesheet)) {
            traverseStylesheets(stylesheet, callback);
        } else {
            callback(stylesheet);
        }
    }
}

function trackMutations(tmpl: Template) {
    if (!isUndefined(tmpl.stylesheets)) {
        trackStylesheetsMutation(tmpl.stylesheets);
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
                if (!mutationTrackingDisabled) {
                    reportTemplateViolation(prop);
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
            reportTemplateViolation('stylesheetTokens');
            // Avoid logging/reporting twice (for both stylesheetToken and stylesheetTokens)
            mutationTrackingDisabled = true;
            originalDescriptor!.set!.call(this, value);
            mutationTrackingDisabled = false;
        },
    });
}

function addLegacyStylesheetTokensShim(tmpl: Template) {
    // When ENABLE_FROZEN_TEMPLATE is false, then we shim stylesheetTokens on top of stylesheetToken for anyone who
    // is accessing the old internal API (backwards compat). Details: W-14210169
    defineProperty(tmpl, 'stylesheetTokens', {
        enumerable: true,
        configurable: true,
        get() {
            const { stylesheetToken } = this;
            if (isUndefined(stylesheetToken)) {
                return stylesheetToken;
            }
            // Shim for the old `stylesheetTokens` property
            // See https://github.com/salesforce/lwc/pull/2332/files#diff-7901555acef29969adaa6583185b3e9bce475cdc6f23e799a54e0018cb18abaa
            return {
                hostAttribute: `${stylesheetToken}-host`,
                shadowAttribute: stylesheetToken,
            };
        },

        set(value) {
            // If the value is null or some other exotic object, you would be broken anyway in the past
            // because the engine would try to access hostAttribute/shadowAttribute, which would throw an error.
            // However it may be undefined in newer versions of LWC, so we need to guard against that case.
            this.stylesheetToken = isUndefined(value) ? undefined : (value as any).shadowAttribute;
        },
    });
}

export function freezeTemplate(tmpl: Template) {
    // TODO [#2782]: remove this flag and delete the legacy behavior
    if (lwcRuntimeFlags.ENABLE_FROZEN_TEMPLATE) {
        // Deep freeze the template
        freeze(tmpl);
        if (!isUndefined(tmpl.stylesheets)) {
            deepFreeze(tmpl.stylesheets);
        }
    } else {
        // template is not frozen - shim, report, and warn

        // this shim should be applied in both dev and prod
        addLegacyStylesheetTokensShim(tmpl);

        // When ENABLE_FROZEN_TEMPLATE is false, we want to warn in dev mode whenever someone is mutating the template
        if (process.env.NODE_ENV !== 'production') {
            trackMutations(tmpl);
        } else {
            // In prod mode, we only track mutations if reporting is enabled
            onReportingEnabled(() => {
                trackMutations(tmpl);
            });
        }
    }
}

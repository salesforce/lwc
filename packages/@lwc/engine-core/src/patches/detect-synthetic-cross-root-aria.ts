/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    assign,
    isTrue,
    KEY__NATIVE_GET_ELEMENT_BY_ID,
    KEY__NATIVE_QUERY_SELECTOR_ALL,
    isNull,
    isUndefined,
    getOwnPropertyDescriptor,
    defineProperty,
    ID_REFERENCING_ATTRIBUTES_SET,
    isString,
    isFunction,
    StringSplit,
    ArrayFilter,
    hasOwnProperty,
    KEY__SHADOW_TOKEN,
} from '@lwc/shared';
import { onReportingEnabled, report, ReportingEventId } from '../framework/reporting';
import { getAssociatedVMIfPresent, VM } from '../framework/vm';
import { logWarnOnce } from '../shared/logger';

//
// The goal of this code is to detect invalid cross-root ARIA references in synthetic shadow DOM.
// These invalid references should be fixed before the offending components can be migrated to native shadow DOM.
// When invalid usage is detected, we warn in dev mode and call the reporting API if enabled.
// See: https://sfdc.co/synthetic-aria
//

// Use the unpatched native getElementById/querySelectorAll rather than the synthetic one
const getElementById = (globalThis as any)[
    KEY__NATIVE_GET_ELEMENT_BY_ID
] as typeof document.getElementById;

const querySelectorAll = (globalThis as any)[
    KEY__NATIVE_QUERY_SELECTOR_ALL
] as typeof document.querySelectorAll;

// This is a "handoff" from synthetic-shadow to engine-core – we want to clean up after ourselves
// so nobody else can misuse these global APIs.
delete (globalThis as any)[KEY__NATIVE_GET_ELEMENT_BY_ID];
delete (globalThis as any)[KEY__NATIVE_QUERY_SELECTOR_ALL];

function isSyntheticShadowRootInstance(rootNode: Node): rootNode is ShadowRoot {
    return rootNode !== document && isTrue((rootNode as any).synthetic);
}

function reportViolation(source: Element, target: Element, attrName: string) {
    // The vm is either for the source, the target, or both. Either one or both must be using synthetic
    // shadow for a violation to be detected.
    let vm: VM | undefined = getAssociatedVMIfPresent((source.getRootNode() as ShadowRoot).host);
    if (isUndefined(vm)) {
        vm = getAssociatedVMIfPresent((target.getRootNode() as ShadowRoot).host);
    }
    if (isUndefined(vm)) {
        // vm should never be undefined here, but just to be safe, bail out and don't report
        return;
    }
    report(ReportingEventId.CrossRootAriaInSyntheticShadow, {
        tagName: vm.tagName,
        attributeName: attrName,
    });
    if (process.env.NODE_ENV !== 'production') {
        // Avoid excessively logging to the console in the case of duplicates.
        logWarnOnce(
            `Element <${source.tagName.toLowerCase()}> uses attribute "${attrName}" to reference element ` +
                `<${target.tagName.toLowerCase()}>, which is not in the same shadow root. This will break in native shadow DOM. ` +
                `For details, see: https://sfdc.co/synthetic-aria`,
            vm
        );
    }
}

function parseIdRefAttributeValue(attrValue: any): string[] {
    // split on whitespace and skip empty strings after splitting
    return isString(attrValue) ? ArrayFilter.call(StringSplit.call(attrValue, /\s+/), Boolean) : [];
}

function detectSyntheticCrossRootAria(elm: Element, attrName: string, attrValue: any) {
    const root = elm.getRootNode();
    if (!isSyntheticShadowRootInstance(root)) {
        return;
    }

    if (attrName === 'id') {
        // elm is the target, find the source
        if (!isString(attrValue) || attrValue.length === 0) {
            // if our id is null or empty, nobody can reference us
            return;
        }
        for (const idRefAttrName of ID_REFERENCING_ATTRIBUTES_SET) {
            // Query all global elements with this attribute. The attribute selector syntax `~=` is for values
            // that reference multiple IDs, separated by whitespace.
            const query = `[${idRefAttrName}~="${CSS.escape(attrValue)}"]`;
            const sourceElements = querySelectorAll.call(document, query);
            for (let i = 0; i < sourceElements.length; i++) {
                const sourceElement = sourceElements[i];
                const sourceRoot = sourceElement.getRootNode();
                if (sourceRoot !== root) {
                    reportViolation(sourceElement, elm, idRefAttrName);
                    break;
                }
            }
        }
    } else {
        // elm is the source, find the target
        const ids = parseIdRefAttributeValue(attrValue);
        for (const id of ids) {
            const target = getElementById.call(document, id);
            if (!isNull(target)) {
                const targetRoot = target.getRootNode();
                if (targetRoot !== root) {
                    // target element's shadow root is not the same as ours
                    reportViolation(elm, target, attrName);
                }
            }
        }
    }
}

let enabled = false;

// We want to avoid patching globals whenever possible, so this should be tree-shaken out in prod-mode and if
// reporting is not enabled. It should also only run once
function enableDetection() {
    if (enabled) {
        return; // don't double-apply the patches
    }
    enabled = true;

    const { setAttribute } = Element.prototype;

    // Detect calling `setAttribute` to set an idref or an id
    assign(Element.prototype, {
        setAttribute(this: Element, attrName: string, attrValue: any) {
            setAttribute.call(this, attrName, attrValue);
            if (attrName === 'id' || ID_REFERENCING_ATTRIBUTES_SET.has(attrName)) {
                detectSyntheticCrossRootAria(this, attrName, attrValue);
            }
        },
    } as Pick<Element, 'setAttribute'>);

    // Detect `elm.id = 'foo'`
    const idDescriptor = getOwnPropertyDescriptor(Element.prototype, 'id');
    if (!isUndefined(idDescriptor)) {
        const { get, set } = idDescriptor;
        // These should always be a getter and a setter, but if someone is monkeying with the global descriptor, ignore it
        if (isFunction(get) && isFunction(set)) {
            defineProperty(Element.prototype, 'id', {
                get() {
                    return get.call(this);
                },
                set(value: any) {
                    set.call(this, value);
                    detectSyntheticCrossRootAria(this, 'id', value);
                },
                // On the default descriptor for 'id', enumerable and configurable are true
                enumerable: true,
                configurable: true,
            });
        }
    }
}

// Our detection logic relies on some modern browser features. We can just skip reporting the data
// for unsupported browsers
function supportsCssEscape() {
    return typeof CSS !== 'undefined' && isFunction(CSS.escape);
}

// If this page is not using synthetic shadow, then we don't need to install detection. Note
// that we are assuming synthetic shadow is loaded before LWC.
function isSyntheticShadowLoaded() {
    // We should probably be calling `renderer.isSyntheticShadowDefined`, but 1) we don't have access to the renderer,
    // and 2) this code needs to run in @lwc/engine-core, so it can access `logWarn()` and `report()`.
    return hasOwnProperty.call(Element.prototype, KEY__SHADOW_TOKEN);
}

// Detecting cross-root ARIA in synthetic shadow only makes sense for the browser
if (process.env.IS_BROWSER && supportsCssEscape() && isSyntheticShadowLoaded()) {
    // Always run detection in dev mode, so we can at least print to the console
    if (process.env.NODE_ENV !== 'production') {
        enableDetection();
    } else {
        // In prod mode, only enable detection if reporting is enabled
        onReportingEnabled(enableDetection);
    }
}

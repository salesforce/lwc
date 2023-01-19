/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import features from '@lwc/features';
import { defineProperty, getOwnPropertyDescriptor, isNull, isUndefined } from '@lwc/shared';
import { onReportingEnabled, report, ReportingEventId } from '../framework/reporting';
import { LightningElement } from '../framework/base-lightning-element';
import { logWarnOnce } from '../shared/logger';
import { getAssociatedVMIfPresent, VM } from '../framework/vm';
import { BaseBridgeElement } from '../framework/base-bridge-element';

//
// The goal of this code is to detect usages of non-standard reflected ARIA properties. These are caused by
// legacy non-standard Element.prototype extensions added by the @lwc/aria-reflection package.
//

// See the README for @lwc/aria-reflection
const NON_STANDARD_ARIA_PROPS = [
    'ariaActiveDescendant',
    'ariaControls',
    'ariaDescribedBy',
    'ariaDetails',
    'ariaErrorMessage',
    'ariaFlowTo',
    'ariaLabelledBy',
    'ariaOwns',
];

function isLightningElement(elm: Element) {
    // The former case is for `this.prop` (inside component) and the latter is for `element.prop` (outside component).
    // In both cases, we apply the non-standard prop even when the global polyfill is disabled, so this is kosher.
    return elm instanceof LightningElement || elm instanceof BaseBridgeElement;
}

function findVM(elm: Element): VM | undefined {
    // If it's a shadow DOM component, then it has a host
    const { host } = elm.getRootNode() as ShadowRoot;
    const vm = isUndefined(host) ? undefined : getAssociatedVMIfPresent(host);
    if (!isUndefined(vm)) {
        return vm;
    }
    // Else it might be a light DOM component. Walk up the tree trying to find the owner
    let parentElement: Element | null = elm;
    while (!isNull((parentElement = parentElement.parentElement))) {
        if (isLightningElement(parentElement)) {
            const vm = getAssociatedVMIfPresent(parentElement);
            if (!isUndefined(vm)) {
                return vm;
            }
        }
    }
    // If we return undefined, it's because the element was rendered wholly outside a LightningElement
}

function checkAndReportViolation(elm: Element, prop: string) {
    if (!isLightningElement(elm)) {
        const vm = findVM(elm);

        if (process.env.NODE_ENV !== 'production') {
            logWarnOnce(
                `Element <${elm.tagName.toLowerCase()}> ` +
                    (isUndefined(vm) ? '' : `owned by <${vm.elm.tagName.toLowerCase()}> `) +
                    `uses non-standard property "${prop}". This will be removed in a future version of LWC. ` +
                    `See https://lwc.dev/guide/accessibility#deprecated-aria-reflected-properties`
            );
        }
        report(ReportingEventId.NonStandardAriaReflection, {
            tagName: vm?.tagName,
            propertyName: prop,
        });
    }
}

function enableDetection() {
    const { prototype } = Element;
    for (const prop of NON_STANDARD_ARIA_PROPS) {
        const descriptor = getOwnPropertyDescriptor(prototype, prop);
        // The descriptor should exist because the @lwc/aria-reflection polyfill has run by now.
        // This happens automatically because of the ordering of imports.
        if (process.env.NODE_ENV !== 'production') {
            /* istanbul ignore if */
            if (
                isUndefined(descriptor) ||
                isUndefined(descriptor.get) ||
                isUndefined(descriptor.set)
            ) {
                // should never happen
                throw new Error('detect-non-standard-aria.ts loaded before @lwc/aria-reflection');
            }
        }
        // @ts-ignore
        const { get, set } = descriptor;
        defineProperty(prototype, prop, {
            get() {
                checkAndReportViolation(this, prop);
                return get.call(this);
            },
            set(val) {
                checkAndReportViolation(this, prop);
                return set.call(this, val);
            },
            configurable: true,
            enumerable: true,
        });
    }
}

// No point in running this code if we're not in a browser, or if the global polyfill is not loaded
if (process.env.IS_BROWSER) {
    if (!features.DISABLE_ARIA_REFLECTION_POLYFILL) {
        // Always run detection in dev mode, so we can at least print to the console
        if (process.env.NODE_ENV !== 'production') {
            enableDetection();
        } else {
            // In prod mode, only enable detection if reporting is enabled
            onReportingEnabled(enableDetection);
        }
    }
}

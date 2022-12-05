/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isNull, isFalse, defineProperties, defineProperty } from '@lwc/shared';

import {
    hasAttribute,
    innerTextGetter,
    innerTextSetter,
    outerTextGetter,
    outerTextSetter,
    tabIndexGetter,
    tabIndexSetter,
} from '../env/element';

import { isDelegatingFocus, isSyntheticShadowHost } from './shadow-root';
import {
    disableKeyboardFocusNavigationRoutines,
    enableKeyboardFocusNavigationRoutines,
    getActiveElement,
    handleFocus,
    handleFocusIn,
    hostElementFocus,
    ignoreFocus,
    ignoreFocusIn,
    isKeyboardFocusNavigationRoutineEnabled,
} from './focus';

const { blur, focus } = HTMLElement.prototype;

/**
 * This method only applies to elements with a shadow attached to them
 */
function tabIndexGetterPatched(this: HTMLElement) {
    if (isDelegatingFocus(this) && isFalse(hasAttribute.call(this, 'tabindex'))) {
        // this covers the case where the default tabindex should be 0 because the
        // custom element is delegating its focus
        return 0;
    }
    return tabIndexGetter.call(this);
}

/**
 * This method only applies to elements with a shadow attached to them
 */
function tabIndexSetterPatched(this: HTMLElement, value: any) {
    // This tabIndex setter might be confusing unless it is understood that HTML
    // elements have default tabIndex property values. Natively focusable elements have
    // a default tabIndex value of 0 and all other elements have a default tabIndex
    // value of -1. For example, the tabIndex property value is -1 for both <x-foo> and
    // <x-foo tabindex="-1">, but our delegatesFocus polyfill should only kick in for
    // the latter case when the value of the tabindex attribute is -1.

    const delegatesFocus = isDelegatingFocus(this);

    // Record the state of things before invoking component setter.
    const prevValue = tabIndexGetter.call(this);
    const prevHasAttr = hasAttribute.call(this, 'tabindex');

    tabIndexSetter.call(this, value);

    // Record the state of things after invoking component setter.
    const currValue = tabIndexGetter.call(this);
    const currHasAttr = hasAttribute.call(this, 'tabindex');

    const didValueChange = prevValue !== currValue;

    // If the tabindex attribute is initially rendered, we can assume that this setter has
    // previously executed and a listener has been added. We must remove that listener if
    // the tabIndex property value has changed or if the component no longer renders a
    // tabindex attribute.
    if (prevHasAttr && (didValueChange || isFalse(currHasAttr))) {
        if (prevValue === -1) {
            ignoreFocusIn(this);
        }
        if (prevValue === 0 && delegatesFocus) {
            ignoreFocus(this);
        }
    }

    // If a tabindex attribute was not rendered after invoking its setter, it means the
    // component is taking control. Do nothing.
    if (isFalse(currHasAttr)) {
        return;
    }

    // If the tabindex attribute is initially rendered, we can assume that this setter has
    // previously executed and a listener has been added. If the tabindex attribute is still
    // rendered after invoking the setter AND the tabIndex property value has not changed,
    // we don't need to do any work.
    if (prevHasAttr && currHasAttr && isFalse(didValueChange)) {
        return;
    }

    // At this point we know that a tabindex attribute was rendered after invoking the
    // setter and that either:
    // 1) This is the first time this setter is being invoked.
    // 2) This is not the first time this setter is being invoked and the value is changing.
    // We need to add the appropriate listeners in either case.
    if (currValue === -1) {
        // Add the magic to skip the shadow tree
        handleFocusIn(this);
    }
    if (currValue === 0 && delegatesFocus) {
        // Add the magic to skip the host element
        handleFocus(this);
    }
}

/**
 * This method only applies to elements with a shadow attached to them
 */
function blurPatched(this: HTMLElement) {
    if (isDelegatingFocus(this)) {
        const currentActiveElement = getActiveElement(this);
        if (!isNull(currentActiveElement)) {
            // if there is an active element, blur it (intentionally using the dot notation in case the user defines the blur routine)
            (currentActiveElement as HTMLElement).blur();
            return;
        }
    }
    return blur.call(this);
}

function focusPatched(this: HTMLElement) {
    // Save enabled state
    const originallyEnabled = isKeyboardFocusNavigationRoutineEnabled();

    // Change state by disabling if originally enabled
    if (originallyEnabled) {
        disableKeyboardFocusNavigationRoutines();
    }

    if (isSyntheticShadowHost(this) && isDelegatingFocus(this)) {
        hostElementFocus.call(this);
        return;
    }

    // Typescript does not like it when you treat the `arguments` object as an array
    // @ts-ignore type-mismatch
    focus.apply(this, arguments);

    // Restore state by enabling if originally enabled
    if (originallyEnabled) {
        enableKeyboardFocusNavigationRoutines();
    }
}

// Non-deep-traversing patches: this descriptor map includes all descriptors that
// do not five access to nodes beyond the immediate children.
defineProperties(HTMLElement.prototype, {
    tabIndex: {
        get(this: HTMLElement): number {
            if (isSyntheticShadowHost(this)) {
                return tabIndexGetterPatched.call(this);
            }
            return tabIndexGetter.call(this);
        },
        set(this: HTMLElement, v: any) {
            if (isSyntheticShadowHost(this)) {
                return tabIndexSetterPatched.call(this, v);
            }
            return tabIndexSetter.call(this, v);
        },
        enumerable: true,
        configurable: true,
    },
    blur: {
        value(this: HTMLElement) {
            if (isSyntheticShadowHost(this)) {
                return blurPatched.call(this);
            }
            blur.call(this);
        },
        enumerable: true,
        writable: true,
        configurable: true,
    },
    focus: {
        value(this: HTMLElement) {
            // Typescript does not like it when you treat the `arguments` object as an array
            // @ts-ignore type-mismatch
            focusPatched.apply(this, arguments);
        },
        enumerable: true,
        writable: true,
        configurable: true,
    },
});

// Note: In JSDOM innerText is not implemented: https://github.com/jsdom/jsdom/issues/1245
if (innerTextGetter !== null && innerTextSetter !== null) {
    defineProperty(HTMLElement.prototype, 'innerText', {
        get(this: HTMLElement): string {
            // Note: we deviate from native shadow here, but are not fixing
            // due to backwards compat: https://github.com/salesforce/lwc/pull/3103
            return innerTextGetter!.call(this);
        },
        set(this: HTMLElement, v: string) {
            innerTextSetter!.call(this, v);
        },
        enumerable: true,
        configurable: true,
    });
}

// Note: Firefox does not have outerText, https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/outerText
if (outerTextGetter !== null && outerTextSetter !== null) {
    // From https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/outerText :
    // HTMLElement.outerText is a non-standard property. As a getter, it returns the same value as Node.innerText.
    // As a setter, it removes the current node and replaces it with the given text.
    defineProperty(HTMLElement.prototype, 'outerText', {
        get(this: HTMLElement): string {
            // Note: we deviate from native shadow here, but are not fixing
            // due to backwards compat: https://github.com/salesforce/lwc/pull/3103
            return outerTextGetter!.call(this);
        },
        set(this: HTMLElement, v: string) {
            // Invoking the `outerText` setter on a host element should trigger its disconnection, but until we merge node reactions, it will not work.
            // We could reimplement the outerText setter in JavaScript ([blink implementation](https://source.chromium.org/chromium/chromium/src/+/master:third_party/blink/renderer/core/html/html_element.cc;l=841-879;drc=6e8b402a6231405b753919029c9027404325ea00;bpv=0;bpt=1))
            // but the benefits don't worth the efforts.
            outerTextSetter!.call(this, v);
        },
        enumerable: true,
        configurable: true,
    });
}

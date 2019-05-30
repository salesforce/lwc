/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isDelegatingFocus, hasSyntheticShadow } from './shadow-root';
import { hasAttribute, tabIndexGetter, tabIndexSetter } from '../env/element';
import { isNull, isFalse, defineProperties } from '../shared/language';
import { getActiveElement, handleFocusIn, handleFocus, ignoreFocusIn, ignoreFocus } from './focus';

const { blur } = HTMLElement.prototype;

/**
 * This method only applies to elements with a shadow attached to them
 */
function tabIndexGetterPatched(this: HTMLElement) {
    if (isDelegatingFocus(this) && isFalse(hasAttribute.call(this, 'tabindex'))) {
        // this cover the case where the default tabindex should be 0 because the
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

// Non-deep-traversing patches
defineProperties(HTMLElement.prototype, {
    tabIndex: {
        get(this: HTMLElement): number {
            if (hasSyntheticShadow(this)) {
                return tabIndexGetterPatched.call(this);
            }
            return tabIndexGetter.call(this);
        },
        set(this: HTMLElement, v: any) {
            if (hasSyntheticShadow(this)) {
                return tabIndexSetterPatched.call(this, v);
            }
            return tabIndexSetter.call(this, v);
        },
        enumerable: true,
        configurable: true,
    },
    blur: {
        value(this: HTMLElement) {
            if (hasSyntheticShadow(this)) {
                return blurPatched.call(this);
            }
            blur.call(this);
        },
        enumerable: true,
        writable: true,
        configurable: true,
    },
});

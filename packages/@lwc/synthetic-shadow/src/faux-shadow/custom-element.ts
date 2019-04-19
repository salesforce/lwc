/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    attachShadow,
    getShadowRoot,
    SyntheticShadowRootInterface,
    isDelegatingFocus,
    getIE11FakeShadowRootPlaceholder,
} from './shadow-root';
import { addCustomElementEventListener, removeCustomElementEventListener } from './events';
import { PatchedElement, getNodeOwner, getAllMatches, getFilteredChildNodes } from './traverse';
import { hasAttribute, tabIndexGetter, childrenGetter } from '../env/element';
import {
    isNull,
    isFalse,
    getPropertyDescriptor,
    ArrayFilter,
    ArrayUnshift,
} from '../shared/language';
import { getActiveElement, handleFocusIn, handleFocus, ignoreFocusIn, ignoreFocus } from './focus';
import { createStaticNodeList } from '../shared/static-node-list';
import { createStaticHTMLCollection } from '../shared/static-html-collection';
import { hasNativeSymbolsSupport, isExternalChildNodeAccessorFlagOn } from './node';

export interface HTMLElementConstructor {
    prototype: HTMLElement;
    new (): HTMLElement;
}

export function PatchedCustomElement(Base: HTMLElement): HTMLElementConstructor {
    const Ctor = PatchedElement(Base) as HTMLElementConstructor;
    return class PatchedHTMLElement extends Ctor {
        attachShadow(options: ShadowRootInit): SyntheticShadowRootInterface {
            return attachShadow(this, options) as SyntheticShadowRootInterface;
        }
        addEventListener(
            this: EventTarget,
            type: string,
            listener: EventListener,
            options?: boolean | AddEventListenerOptions
        ) {
            addCustomElementEventListener(this as HTMLElement, type, listener, options);
        }
        removeEventListener(
            this: EventTarget,
            type: string,
            listener: EventListener,
            options?: boolean | AddEventListenerOptions
        ) {
            removeCustomElementEventListener(this as HTMLElement, type, listener, options);
        }
        get shadowRoot(this: HTMLElement): SyntheticShadowRootInterface | null {
            const shadow = getShadowRoot(this);
            if (shadow.mode === 'open') {
                return shadow;
            }
            return null;
        }
        get tabIndex(this: HTMLElement) {
            if (isDelegatingFocus(this) && isFalse(hasAttribute.call(this, 'tabindex'))) {
                // this cover the case where the default tabindex should be 0 because the
                // custom element is delegating its focus
                return 0;
            }

            // NOTE: Technically this should be `super.tabIndex` however Typescript
            // has a known bug while transpiling down to ES5
            // https://github.com/Microsoft/TypeScript/issues/338
            const descriptor = getPropertyDescriptor(Ctor.prototype, 'tabIndex');
            return descriptor!.get!.call(this);
        }
        set tabIndex(this: HTMLElement, value: any) {
            // This tabIndex setter might be confusing unless it is understood that HTML elements
            // have default tabIndex property values. Natively focusable elements have a default
            // tabIndex value of 0 and all other elements have a default tabIndex value of -1. An
            // example of when this matters: We don't need to do anything for <x-foo> but we do need
            // to add a listener for <x-foo tabindex="-1">. The tabIndex property value is -1 in
            // both cases, so we need an additional check to see if the tabindex attribute is
            // reflected on the host.

            const delegatesFocus = isDelegatingFocus(this);

            // Record the state of things before invoking component setter.
            const prevValue = tabIndexGetter.call(this);
            const prevHasAttr = hasAttribute.call(this, 'tabindex');

            // NOTE: Technically this should be `super.tabIndex` however Typescript
            // has a known bug while transpiling down to ES5
            // https://github.com/Microsoft/TypeScript/issues/338
            const descriptor = getPropertyDescriptor(Ctor.prototype, 'tabIndex');
            descriptor!.set!.call(this, value);

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
        blur(this: HTMLElement) {
            if (isDelegatingFocus(this)) {
                const currentActiveElement = getActiveElement(this);
                if (!isNull(currentActiveElement)) {
                    // if there is an active element, blur it
                    (currentActiveElement as HTMLElement).blur();
                    return;
                }
            }
            super.blur();
        }
        get childNodes(this: HTMLElement): NodeListOf<Node & Element> {
            const owner = getNodeOwner(this);
            const childNodes = isNull(owner)
                ? []
                : getAllMatches(owner, getFilteredChildNodes(this));
            if (
                process.env.NODE_ENV !== 'production' &&
                isFalse(hasNativeSymbolsSupport) &&
                isExternalChildNodeAccessorFlagOn()
            ) {
                // inserting a comment node as the first childNode to trick the IE11
                // DevTool to show the content of the shadowRoot, this should only happen
                // in dev-mode and in IE11 (which we detect by looking at the symbol).
                // Plus it should only be in place if we know it is an external invoker.
                ArrayUnshift.call(childNodes, getIE11FakeShadowRootPlaceholder(this));
            }
            return createStaticNodeList(childNodes);
        }
        get children(this: HTMLElement): HTMLCollectionOf<Element> {
            // We cannot patch `children` in test mode
            // because JSDOM uses children for its "native"
            // querySelector implementation. If we patch this,
            // HTMLElement.prototype.querySelector.call(element) will not
            // return any elements from shadow, which is not what we want
            if (process.env.NODE_ENV === 'test') {
                return childrenGetter.call(this);
            }
            const owner = getNodeOwner(this);
            const childNodes = isNull(owner)
                ? []
                : getAllMatches(owner, getFilteredChildNodes(this));
            return createStaticHTMLCollection(
                ArrayFilter.call(childNodes, (node: Node | Element) => node instanceof Element)
            );
        }
    };
}

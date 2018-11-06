import { attachShadow, getShadowRoot, ShadowRootMode, SyntheticShadowRootInterface } from "./shadow-root";
import { addCustomElementEventListener, removeCustomElementEventListener } from "./events";
import { PatchedElement } from './traverse';
import { hasAttribute, tabIndexGetter } from "../env/element";
import { isNull, isFalse, getPropertyDescriptor } from "../shared/language";
import { getFirstFocusableElement, getActiveElement, isDelegatingFocus, handleFocusIn, ignoreFocusIn } from "./focus";
import { HTMLElementConstructor } from "../framework/base-bridge-element";

export function PatchedCustomElement(Base: HTMLElement): HTMLElementConstructor {
    const Ctor = PatchedElement(Base) as HTMLElementConstructor;
    return class PatchedHTMLElement extends Ctor {
        attachShadow(options: ShadowRootInit): SyntheticShadowRootInterface {
            return attachShadow(this, options) as SyntheticShadowRootInterface;
        }
        addEventListener(this: EventTarget, type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) {
            addCustomElementEventListener(this as HTMLElement, type, listener, options);
        }
        removeEventListener(this: EventTarget, type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) {
            removeCustomElementEventListener(this as HTMLElement, type, listener, options);
        }
        get shadowRoot(this: HTMLElement): SyntheticShadowRootInterface | null {
            const shadow = getShadowRoot(this) as SyntheticShadowRootInterface;
            if (shadow.mode === ShadowRootMode.OPEN) {
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
            // get the original value from the element before changing it, just in case
            // the custom element is doing something funky. we only really care about
            // the actual changes in the DOM.
            const hasAttr = hasAttribute.call(this, 'tabindex');
            const originalValue = tabIndexGetter.call(this);
            // run the super logic, which bridges the setter to the component

            // NOTE: Technically this should be `super.tabIndex` however Typescript
            // has a known bug while transpiling down to ES5
            // https://github.com/Microsoft/TypeScript/issues/338
            const descriptor = getPropertyDescriptor(Ctor.prototype, 'tabIndex');
            descriptor!.set!.call(this, value);

            // Check if the value from the dom has changed
            const newValue = tabIndexGetter.call(this);
            if ((!hasAttr || originalValue !== newValue) && newValue === -1) {
                // add the magic to skip this element
                handleFocusIn(this);
            } else if (originalValue === -1) {
                // remove the magic
                ignoreFocusIn(this);
            }
        }
        focus(this: HTMLElement) {
            if (isDelegatingFocus(this)) {
                const currentActiveElement = getActiveElement(this);
                if (isNull(currentActiveElement)) {
                    const firstNode = getFirstFocusableElement(this);
                    if (!isNull(firstNode)) {
                        // when there is a focusable element, focus should be delegated
                        firstNode.focus();
                        return;
                    }
                } else {
                    // when an already active element is found, focus does nothing
                    return;
                }
            }
            super.focus();
        }
        blur(this: HTMLElement) {
            if (isDelegatingFocus(this)) {
                const currentActiveElement = getActiveElement(this);
                if (!isNull(currentActiveElement)) {
                    // if there is an active element, blur it
                    currentActiveElement.blur();
                    return;
                }
            }
            super.blur();
        }
    };
}

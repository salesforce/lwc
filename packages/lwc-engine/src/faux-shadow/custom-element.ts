import { attachShadow, getShadowRoot, ShadowRootMode } from "./shadow-root";
import { addCustomElementEventListener, removeCustomElementEventListener } from "./events";
import { PatchedElement } from './traverse';
import { hasAttribute } from "./element";
import { getOwnPropertyDescriptor, isNull } from "../shared/language";
import { getFirstFocusableElement, getActiveElement, isDelegatingFocus, handleFocusIn, ignoreFocusIn } from "./focus";
import { HTMLElementConstructor } from "../framework/base-bridge-element";

const tabIndexGetter = getOwnPropertyDescriptor(HTMLElement.prototype, 'tabIndex')!.get as (this: HTMLElement) => number;

export function PatchedCustomElement(Base: HTMLElement): HTMLElementConstructor {
    const Ctor = PatchedElement(Base) as HTMLElementConstructor;
    return class PatchedHTMLElement extends Ctor {
        attachShadow(options: ShadowRootInit): ShadowRoot {
            return attachShadow(this, options) as ShadowRoot;
        }
        addEventListener(this: EventTarget, type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) {
            addCustomElementEventListener(this as HTMLElement, type, listener, options);
        }
        removeEventListener(this: EventTarget, type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) {
            removeCustomElementEventListener(this as HTMLElement, type, listener, options);
        }
        get shadowRoot(this: HTMLElement): ShadowRoot | null {
            const shadow = getShadowRoot(this) as ShadowRoot;
            if (shadow.mode === ShadowRootMode.OPEN) {
                return shadow;
            }
            return null;
        }
        get tabIndex(this: HTMLElement) {
            return super.tabIndex;
        }
        set tabIndex(this: HTMLElement, value: any) {
            // get the original value from the element before changing it, just in case
            // the custom element is doing something funky. we only really care about
            // the actual changes in the DOM.
            const hasAttr = hasAttribute.call(this, 'tabindex');
            const originalValue = tabIndexGetter.call(this);
            // run the super logic, which bridges the setter to the component
            super.tabIndex = value;
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
                // when an active element is found, focus does nothing
                if (isNull(currentActiveElement)) {
                    const firstNode = getFirstFocusableElement(this);
                    if (!isNull(firstNode)) {
                        firstNode.focus();
                    }
                }
                return;
            }
            super.focus();
        }
        blur(this: HTMLElement) {
            if (isDelegatingFocus(this)) {
                const currentActiveElement = getActiveElement(this);
                // if there is no active element, blur does nothing
                if (!isNull(currentActiveElement)) {
                    currentActiveElement.focus();
                }
                return;
            }
            super.blur();
        }
    };
}

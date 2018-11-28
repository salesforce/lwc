import { attachShadow, getShadowRoot, ShadowRootMode, SyntheticShadowRootInterface, isDelegatingFocus } from "./shadow-root";
import { addCustomElementEventListener, removeCustomElementEventListener } from "./events";
import { PatchedElement, getNodeOwner, getAllMatches, getFilteredChildNodes } from './traverse';
import { hasAttribute, tabIndexGetter, childrenGetter, tagNameGetter } from "../env/element";
import { cloneNode as nativeCloneNode } from '../env/node';
import { isNull, isFalse, getPropertyDescriptor, ArrayFilter } from "../shared/language";
import { getActiveElement, handleFocusIn, handleFocus, ignoreFocusIn, ignoreFocus } from "./focus";
import { HTMLElementConstructor } from "../framework/base-bridge-element";
import { createStaticNodeList } from "../shared/static-node-list";
import { createStaticHTMLCollection } from "../shared/static-html-collection";
import { createVM } from "../framework/vm";

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
            if ((!hasAttr || originalValue !== newValue)) {
                // Value has changed
                if (newValue === -1) {
                    // add the magic to skip this element
                    handleFocusIn(this);
                } else if (newValue === 0 && isDelegatingFocus(this)) {
                    // Listen for focus if the new tabIndex is 0, and we are delegating focus
                    handleFocus(this);
                } else {
                    // TabIndex is set to 0, but we aren't delegating focus, so we can ignore everything
                    ignoreFocusIn(this);
                    ignoreFocus(this);
                }
            } else if (originalValue === -1) {
                // remove the magic
                ignoreFocusIn(this);
                ignoreFocus(this);
            }
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
        get childNodes(this: HTMLElement): NodeListOf<Node & Element> {
            const owner = getNodeOwner(this);
            const childNodes = isNull(owner) ? [] : getAllMatches(owner, getFilteredChildNodes(this));
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
            const childNodes = isNull(owner) ? [] : getAllMatches(owner, getFilteredChildNodes(this));
            return createStaticHTMLCollection(ArrayFilter.call(childNodes, (node: Node | Element) => node instanceof Element));
        }
        cloneNode(deep: boolean): Node {
            const clone = nativeCloneNode.call(this, false);

            if (deep === true) {
                const childNodes = this.childNodes;
                for(let i = 0, len = childNodes.length; i < len; i += 1) {
                    clone.appendChild(childNodes[i].cloneNode(true));
                }
            }

            return clone;
        }
    };
}

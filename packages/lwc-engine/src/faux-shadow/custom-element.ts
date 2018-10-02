import { defineProperties } from "../shared/language";
import { attachShadow, getShadowRoot } from "./shadow-root";
import { addCustomElementEventListener, removeCustomElementEventListener } from "./events";

function addEventListenerPatchedValue(this: EventTarget, type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) {
    addCustomElementEventListener(this as HTMLElement, type, listener, options);
}

function removeEventListenerPatchedValue(this: EventTarget, type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) {
    removeCustomElementEventListener(this as HTMLElement, type, listener, options);
}

function attachShadowGetter(this: HTMLElement, options: ShadowRootInit): ShadowRoot {
    return attachShadow(this, options);
}

function getShadowRootPatchedValue(this: HTMLElement) {
    return getShadowRoot(this);
}

const CustomElementPatchDescriptors: PropertyDescriptorMap = {
    attachShadow: {
        value: attachShadowGetter,
        writable: true,
        enumerable: true,
        configurable: true,
    },
    addEventListener: {
        value: addEventListenerPatchedValue,
        configurable: true,
        enumerable: true,
    },
    removeEventListener: {
        value: removeEventListenerPatchedValue,
        configurable: true,
        enumerable: true,
    },
    shadowRoot: {
        get: getShadowRootPatchedValue,
        configurable: true,
        enumerable: true,
    }
};

export function patchCustomElement(elm: HTMLElement) {
    defineProperties(elm, CustomElementPatchDescriptors);
}

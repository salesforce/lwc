import { attachShadow, getShadowRoot, SyntheticShadowRoot, ShadowRootMode } from "./shadow-root";
import { addCustomElementEventListener, removeCustomElementEventListener } from "./events";
import { patchedTabIndexGetter, patchedTabIndexSetter } from "./focus";
import { PatchedElement } from './traverse';

function addEventListenerPatchedValue(this: EventTarget, type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) {
    addCustomElementEventListener(this as HTMLElement, type, listener, options);
}

function removeEventListenerPatchedValue(this: EventTarget, type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) {
    removeCustomElementEventListener(this as HTMLElement, type, listener, options);
}

function attachShadowGetter(this: HTMLElement, options: ShadowRootInit): SyntheticShadowRoot {
    return attachShadow(this, options);
}

function shadowRootGetter(this: HTMLElement): SyntheticShadowRoot | null {
    const shadow = getShadowRoot(this);
    if (shadow.mode === ShadowRootMode.OPEN) {
        return shadow;
    }
    return null;
}

export function PatchedCustomElement(Base) {
    return class extends PatchedElement(Base) {
        get attachShadow() {
            return attachShadowGetter;
        }
        get addEventListener() {
            return addEventListenerPatchedValue;
        }
        get removeEventListener() {
            return removeEventListenerPatchedValue;
        }
        get shadowRoot(this: HTMLElement): ShadowRoot {
            return shadowRootGetter.call(this);
        }
        get tabIndex(this: HTMLElement) {
            return patchedTabIndexGetter.call(this);
        }
        set tabIndex(this: HTMLElement, value: any) {
            patchedTabIndexSetter.call(this, value);
        }
    }
}

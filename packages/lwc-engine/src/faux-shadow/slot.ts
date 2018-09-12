import { defineProperties } from "../shared/language";
import {
    addEventListener,
    removeEventListener,
} from "./element";

function addEventListenerPatchedValue(this: EventTarget, type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) {
    if (type === 'slotchange') {
        // set up the mutation observer to observe and dispatch child nodes mutations
    }
    addEventListener.call(this as HTMLSlotElement, type, listener, options);
}

function removeEventListenerPatchedValue(this: EventTarget, type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) {
    removeEventListener.call(this as HTMLSlotElement, type, listener, options);
}

const HTMLSlotElementPatchDescriptors: PropertyDescriptorMap = {
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
};

export function patchSlotElement(elm: HTMLSlotElement) {
    defineProperties(elm, HTMLSlotElementPatchDescriptors);
}

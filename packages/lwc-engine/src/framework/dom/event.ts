import { getOwnPropertyDescriptor, defineProperties } from "../language";
import { getCustomElementVM } from "../vm";
import { addTemplateEventListener, removeTemplateEventListener } from "../events";

// https://dom.spec.whatwg.org/#dom-event-composed
// This is a very dummy, simple polyfill for composed
if (!getOwnPropertyDescriptor(Event.prototype, 'composed')) {
    defineProperties(Event.prototype, {
        composed: {
            value: true, // yes, assuming all native events are composed (it is a compromise)
            configurable: true,
            enumerable: true,
            writable: true,
        },
    });
    const { CustomEvent: OriginalCustomEvent } = (window as any);
    (window as any).CustomEvent = function PatchedCustomEvent(this: Event, type: string, eventInitDict: CustomEventInit<any>): Event {
        const event = new OriginalCustomEvent(type, eventInitDict);
        // support for composed on custom events
        (event as any).composed = !!(eventInitDict && (eventInitDict as any).composed);
        return event;
    };
    (window as any).CustomEvent.prototype = OriginalCustomEvent.prototype;
}

export const CustomEvent = (window as any).CustomEvent;

export function addEventListenerPatched(this: EventTarget, type: string, listener: EventListener) {
    const vm = getCustomElementVM(this as HTMLElement);
    addTemplateEventListener(vm, type, listener);
}

export function removeEventListenerPatched(this: EventTarget, type: string, listener: EventListener) {
    const vm = getCustomElementVM(this as HTMLElement);
    removeTemplateEventListener(vm, type, listener);
}

export const fallbackListenerPatchDescriptors: PropertyDescriptorMap = {
    addEventListener: {
        value: addEventListenerPatched,
        configurable: true,
        enumerable: true,
    },
    removeEventListener: {
        value: removeEventListenerPatched,
        configurable: true,
        enumerable: true,
    },
};

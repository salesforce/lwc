import { getOwnPropertyDescriptor, defineProperties } from "../language";

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

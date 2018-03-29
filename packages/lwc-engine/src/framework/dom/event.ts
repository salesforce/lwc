import { getOwnPropertyDescriptor, defineProperties } from "../language";

const OriginalCustomEvent = CustomEvent;
const OriginalEvent = Event;

// https://dom.spec.whatwg.org/#dom-event-composed
// This is a very dummy, simple polyfill for composed
if (!getOwnPropertyDescriptor(OriginalEvent.prototype, 'composed')) {
    defineProperties(OriginalEvent.prototype, {
        composed: {
            value: true, // yes, assuming all native events are composed (it is a compromise)
            configurable: true,
            enumerable: true,
            writable: true,
        },
    });
    (window as any).CustomEvent = function PatchedCustomEvent(this: Event, type: string, eventInitDict: CustomEventInit<any>): Event {
        const event = new OriginalCustomEvent(type, eventInitDict);
        // support for composed on custom events
        (event as any).composed = !!(eventInitDict && (eventInitDict as any).composed);
        return event;
    };
    (window as any).CustomEvent.prototype = OriginalCustomEvent.prototype;
}

// intentionally exporting the originals instead of the patched so we can check for instanceof
export {
    OriginalEvent as Event,
    OriginalCustomEvent as CustomEvent,
};

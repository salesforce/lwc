// See note below
import { PatchedCustomEvent } from './polyfill';

export default function detect(): boolean {
    const isComposedPresent = Object.getOwnPropertyDescriptor(Event.prototype, 'composed') !== undefined;

    // We need to check if CustomEvent is out PatchedCustomEvent
    // because jest will recycle the window object, but not refresh
    // Event.prototype.
    const isCustomEventPatched = (window as any).CustomEvent === PatchedCustomEvent;
    return !isComposedPresent && !isCustomEventPatched;
}

import { PatchedCustomEvent } from './polyfill';

export default function detect(): boolean {
    // We need to check if CustomEvent is our PatchedCustomEvent because jest
    // will reset the window object but not constructos and prototypes (e.g.,
    // Event.prototype).
    // https://github.com/jsdom/jsdom#shared-constructors-and-prototypes
    return (window as any).CustomEvent !== PatchedCustomEvent;
}

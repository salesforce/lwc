import assert from "../shared/assert";
import {
    createFieldName,
    getInternalField,
    setInternalField,
} from "../shared/fields";
import { dispatchEvent } from "../env/dom";
import {
    ArrayIndexOf,
    ArrayPush,
    defineProperties,
    forEach,
} from "../shared/language";
import {
    MutationObserverObserve,
    MutationObserver,
} from "../env/window";

// We can use a single observer without having to worry about leaking because
// "Registered observers in a node’s registered observer list have a weak
// reference to the node."
// https://dom.spec.whatwg.org/#garbage-collection
let observer;

const observerConfig: MutationObserverInit = { childList: true };
const SlotChangeKey = createFieldName('slotchange');

function initSlotObserver() {
    return new MutationObserver(mutations => {
        const slots: Node[] = [];
        forEach.call(mutations, mutation => {
            if (process.env.NODE_ENV !== 'production') {
                assert.isTrue(
                    mutation.type === 'childList',
                    `Invalid mutation type: ${
                        mutation.type
                    }. This mutation handler for slots should only handle "childList" mutations.`
                );
            }
            const { target: slot } = mutation;
            if (ArrayIndexOf.call(slots, slot) === -1) {
                ArrayPush.call(slots, slot);
                dispatchEvent.call(slot, new CustomEvent('slotchange'));
            }
        });
    });
}

export function patchSlotElement(elm: HTMLSlotElement) {
    const { addEventListener: superAddEventListener } = elm;
    defineProperties(elm, {
        addEventListener: {
            value(this: EventTarget, type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) {
                if (type === 'slotchange' && !getInternalField(this, SlotChangeKey)) {
                    if (process.env.NODE_ENV === 'test') {
                        /* tslint:disable-next-line:no-console */
                        console.warn('The "slotchange" event is not supported in our jest test environment.');
                    }
                    setInternalField(this, SlotChangeKey, true);
                    if (!observer) {
                        observer = initSlotObserver();
                    }
                    MutationObserverObserve.call(observer, this as Node, observerConfig);
                }
                superAddEventListener.call(this as HTMLSlotElement, type, listener, options);
            },
            configurable: true,
            enumerable: true,
        },
    });
}

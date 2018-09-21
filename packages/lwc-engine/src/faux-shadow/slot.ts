import assert from "../shared/assert";
import { addEventListener } from "./element";
import {
    createFieldName,
    getInternalField,
    setInternalField,
} from "../shared/fields";
import { dispatchEvent } from "./event-target";
import {
    ArrayIndexOf,
    ArrayPush,
    defineProperties,
    forEach,
} from "../shared/language";

// We can use a single observer without having to worry about leaking because
// "Registered observers in a node’s registered observer list have a weak
// reference to the node."
// https://dom.spec.whatwg.org/#garbage-collection
let observer;

function initSlotObserver() {
    // MutationObserver is not yet implemented in jsdom:
    // https://github.com/jsdom/jsdom/issues/639
    if (typeof MutationObserver === 'undefined') {
        return observer = {
            observe() {
                assert.isTrue(
                    process.env.NODE_ENV === 'test',
                    'MutationObserver should not be mocked outside of the jest test environment'
                );
            },
        };
    }

    const slotchangeEventConfig: CustomEventInit = { bubbles: true };

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
                dispatchEvent.call(slot, new CustomEvent('slotchange', slotchangeEventConfig));
            }
        });
    });
}

const observe = MutationObserver.prototype.observe;
const observerConfig: MutationObserverInit = { childList: true };
const SlotChangeKey = createFieldName('slotchange');

function addEventListenerPatchedValue(this: EventTarget, type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) {
    if (type === 'slotchange' && !getInternalField(this, SlotChangeKey)) {
        if (process.env.NODE_ENV === 'test') {
            /* tslint:disable-next-line:no-console */
            console.warn('The "slotchange" event is not supported in our jest test environment.');
        }
        setInternalField(this, SlotChangeKey, true);
        if (!observer) {
            observer = initSlotObserver();
        }
        observe.call(observer, this as Node, observerConfig);
    }
    addEventListener.call(this as HTMLSlotElement, type, listener, options);
}

const HTMLSlotElementPatchDescriptors: PropertyDescriptorMap = {
    addEventListener: {
        value: addEventListenerPatchedValue,
        configurable: true,
        enumerable: true,
    },
};

export function patchSlotElement(elm: HTMLSlotElement) {
    defineProperties(elm, HTMLSlotElementPatchDescriptors);
}

import assert from "../shared/assert";
import { matches, querySelectorAll, getBoundingClientRect, addEventListener, removeEventListener, tabIndexGetter, tagNameGetter, hasAttribute, getAttribute } from '../env/element';
import { DOCUMENT_POSITION_CONTAINED_BY, compareDocumentPosition, DOCUMENT_POSITION_PRECEDING, DOCUMENT_POSITION_FOLLOWING } from '../env/node';
import { ArraySlice, ArrayIndexOf, isFalse, isNull, toString, ArrayReverse, hasOwnProperty } from '../shared/language';
import { DocumentPrototypeActiveElement, querySelectorAll as documentQuerySelectorAll } from '../env/document';
import { eventCurrentTargetGetter, eventTargetGetter, focusEventRelatedTargetGetter } from '../env/dom';

const TabbableElementsQuery = `
    button:not([tabindex="-1"]):not([disabled]),
    [contenteditable]:not([tabindex="-1"]),
    video[controls]:not([tabindex="-1"]),
    audio[controls]:not([tabindex="-1"]),
    [href]:not([tabindex="-1"]),
    input:not([tabindex="-1"]):not([disabled]),
    select:not([tabindex="-1"]):not([disabled]),
    textarea:not([tabindex="-1"]):not([disabled]),
    [tabindex="0"]
`;

function isVisible(element: HTMLElement): boolean {
    const { width, height } = getBoundingClientRect.call(element);
    const noZeroSize = width > 0 || height > 0;
    return (
        noZeroSize &&
        getComputedStyle(element).visibility !== 'hidden'
    );
}

function hasFocusableTabIndex(element: HTMLElement) {
    if (isFalse(hasAttribute.call(element, 'tabindex'))) {
        return false;
    }

    const value = getAttribute.call(element, 'tabindex');

    // Really, any numeric tabindex value is valid
    // But LWC only allows 0 or -1, so we can just check against that.
    // The main point here is to make sure the tabindex attribute is not an invalid
    // value like tabindex="hello"
    if (value === '' || (value !== '0' && value !== '-1')) {
        return false;
    }
    return true;
}

// This function based on https://allyjs.io/data-tables/focusable.html
// It won't catch everything, but should be good enough
// There are a lot of edge cases here that we can't realistically handle
// Determines if a particular element is tabbable, as opposed to simply focusable

// Exported for jest purposes
export function isTabbable(element: HTMLElement): boolean {
    return matches.call(element, TabbableElementsQuery) && isVisible(element);
}

const focusableTagNames = {
    IFRAME: 1,
    VIDEO: 1,
    AUDIO: 1,
    A: 1,
    INPUT: 1,
    SELECT: 1,
    TEXTAREA: 1,
    BUTTON: 1,
};

// This function based on https://allyjs.io/data-tables/focusable.html
// It won't catch everything, but should be good enough
// There are a lot of edge cases here that we can't realistically handle
// Exported for jest purposes
export function isFocusable(element: HTMLElement): boolean {
    const tagName = tagNameGetter.call(element);
    return (
        (
            isVisible(element)
        ) && (
            hasFocusableTabIndex(element) ||
            hasAttribute.call(element, 'contenteditable') ||
            hasOwnProperty.call(focusableTagNames, tagName)
        )
    );
}

function getFirstTabbableMatch(elements: HTMLElement[]): HTMLElement | null {
    for (let i = 0, len = elements.length; i < len; i += 1) {
        const elm = elements[i];
        if (isTabbable(elm)) {
            return elm;
        }
    }
    return null;
}

function getLastTabbableMatch(elements: HTMLElement[]): HTMLElement | null {
    for (let i = elements.length - 1; i >= 0; i -= 1) {
        const elm = elements[i];
        if (isTabbable(elm)) {
            return elm;
        }
    }
    return null;
}

interface QuerySegments {
    prev: HTMLElement[];
    inner: HTMLElement[];
    next: HTMLElement[];
}

function getTabbableSegments(host: HTMLElement): QuerySegments {
    const all = documentQuerySelectorAll.call(document, TabbableElementsQuery);
    const inner = querySelectorAll.call(host, TabbableElementsQuery);
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(tabIndexGetter.call(host) === -1, `The focusin event is only relevant when the tabIndex property is -1 on the host.`);
    }
    const firstChild = inner[0];
    const lastChild = inner[inner.length - 1];
    const prev = ArraySlice.call(all, 0, ArrayIndexOf.call(all, firstChild));
    const next = ArraySlice.call(all, ArrayIndexOf.call(all, lastChild) + 1);
    return {
        prev,
        inner,
        next,
    };
}

export function getFirstTabbableElement(host: HTMLElement): HTMLElement | null {
    const local = querySelectorAll.call(host, TabbableElementsQuery);
    return getFirstTabbableMatch(local);
}

export function getActiveElement(host: HTMLElement): HTMLElement | null {
    const activeElement = DocumentPrototypeActiveElement.call(document);
    if (isNull(activeElement)) {
        return activeElement;
    }
    // activeElement must be child of the host and owned by it
    return (compareDocumentPosition.call(host, activeElement) & DOCUMENT_POSITION_CONTAINED_BY) !== 0 ? activeElement : null;
}

function relatedTargetPosition(host: HTMLElement, relatedTarget: HTMLElement): number {
    // assert: target must be child of host
    const pos = compareDocumentPosition.call(host, relatedTarget);
    if (pos & DOCUMENT_POSITION_CONTAINED_BY) {
        // focus remains inside the host
        return 0;
    } else if (pos & DOCUMENT_POSITION_PRECEDING) {
        // focus is coming from above
        return 1;
    } else if (pos & DOCUMENT_POSITION_FOLLOWING) {
        // focus is coming from below
        return 2;
    }
    // we don't know what's going on.
    return -1;
}

function getPreviousTabbableElement(segments: QuerySegments): HTMLElement | null {
    const { prev } = segments;
    return getFirstTabbableMatch(ArrayReverse.call(prev));
}

function getNextTabbableElement(segments: QuerySegments): HTMLElement | null {
    const { next } = segments;
    return getFirstTabbableMatch(next);
}

function focusOnNextOrBlur(focusEventTarget: EventTarget, segments: QuerySegments) {
    const nextNode = getNextTabbableElement(segments);
    if (isNull(nextNode)) {
        // nothing to focus on, blur to invalidate the operation
        (focusEventTarget as HTMLElement).blur();
        return;
    }
    nextNode.focus();
}

function focusOnPrevOrBlur(focusEventTarget: EventTarget, segments: QuerySegments) {
    const prevNode = getPreviousTabbableElement(segments);
    if (isNull(prevNode)) {
        // nothing to focus on, blur to invalidate the operation
        (focusEventTarget as HTMLElement).blur();
        return;
    }
    prevNode.focus();
}

function isFirstTabbableChild(target: EventTarget, segments: QuerySegments): boolean {
    return getFirstTabbableMatch(segments.inner) === target;
}

function isLastTabbableChild(target: EventTarget, segments: QuerySegments): boolean {
    return getLastTabbableMatch(segments.inner) === target;
}

function focusInEventHandler(event: FocusEvent) {
    const host: EventTarget = eventCurrentTargetGetter.call(event);
    const target: EventTarget = eventTargetGetter.call(event);
    const relatedTarget: EventTarget = focusEventRelatedTargetGetter.call(event);
    const segments = getTabbableSegments(host as HTMLElement);
    const isFirstFocusableChildReceivingFocus = isFirstTabbableChild(target, segments);
    const isLastFocusableChildReceivingFocus = isLastTabbableChild(target, segments);
    if ((isFalse(isFirstFocusableChildReceivingFocus) && isFalse(isLastFocusableChildReceivingFocus)) || isNull(relatedTarget)) {
        // the focus is definitely not a result of tab or shift-tab interaction
        return;
    }
    // If there is a related target, everything is easier
    const post = relatedTargetPosition(host as HTMLElement, relatedTarget as HTMLElement);
    switch (post) {
        case 1:
            // focus is probably coming from above
            if (isFirstFocusableChildReceivingFocus && relatedTarget === getPreviousTabbableElement(segments)) {
                // the focus was on the immediate focusable elements from above,
                // it is almost certain that the focus is due to tab keypress
                focusOnNextOrBlur(target, segments);
            }
            /**
             * note: false positive here is when the user is clicking
             * directly on the first focusable element inside the next
             * custom element that is wrapping it, and it has
             * delegatesFocus and tabindex="-1", this is very very rare, e.g.:
             * <body>
             *   <x-input>
             *     #shadowRoot(delegatesFocus=true)
             *       <input />  <--- focus in here
             *   <x-input tabindex="-1">
             *     #shadowRoot(delegatesFocus=true)
             *       <input />  <--- user clicks here
             **/
            break;
        case 2:
            // focus is probably coming from below
            // focus is probably coming from above
            if (isLastFocusableChildReceivingFocus && relatedTarget === getNextTabbableElement(segments)) {
                // the focus was on the immediate focusable elements from above,
                // it is almost certain that the focus is due to tab keypress
                focusOnPrevOrBlur(target, segments);
            }
            /**
             * note: false positive here is when the user is clicking
             * directly on the last focusable element inside the next
             * custom element that is wrapping it, and it has
             * delegatesFocus and tabindex="-1", this is very very rare, e.g.:
             * <body>
             *   <x-input tabindex="-1">
             *     #shadowRoot(delegatesFocus=true)
             *       <input />  <--- user clicks here
             *   <x-input>
             *     #shadowRoot(delegatesFocus=true)
             *       <input />  <--- focus in here
             **/
            break;
    }
}

function willTriggerFocusInEvent(target: HTMLElement): boolean {
    return (
        target !== DocumentPrototypeActiveElement.call(document) && // if the element is currently active, it will not fire a focusin event
        isFocusable(target)
    );
}

function stopFocusIn(evt) {
    const currentTarget = eventCurrentTargetGetter.call(evt);
    removeEventListener.call(currentTarget, 'focusin', focusInEventHandler);
    setTimeout(() => {
        // only reinstate the focus if the tabindex is still -1
        if (tabIndexGetter.call(currentTarget) === -1) {
            addEventListener.call(currentTarget, 'focusin', focusInEventHandler);
        }
    }, 0);
}

function handleFocusMouseDown(evt) {
    const target = eventTargetGetter.call(evt);
    // If we are mouse down in an element that can be focused
    // and the currentTarget's activeElement is not element we are mouse-ing down in
    // We can bail out and let the browser do its thing.
    if (willTriggerFocusInEvent(target)) {
        addEventListener.call(eventCurrentTargetGetter.call(evt), 'focusin', stopFocusIn, true);
    }
}

export function handleFocusIn(elm: HTMLElement) {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(tabIndexGetter.call(elm) === -1, `Invalid attempt to handle focus in  ${toString(elm)}. ${toString(elm)} should have tabIndex -1, but has tabIndex ${tabIndexGetter.call(elm)}`);
    }
    // We want to listen for mousedown
    // If the user is triggering a mousedown event on an element
    // That can trigger a focus event, then we need to opt out
    // of our tabindex -1 dance. The tabindex -1 only applies for keyboard navigation
    addEventListener.call(elm, 'mousedown', handleFocusMouseDown, true);

    // This focusin listener is to catch focusin events from keyboard interactions
    // A better solution would perhaps be to listen for keydown events, but
    // the keydown event happens on whatever element already has focus (or no element
    // at all in the case of the location bar. So, instead we have to assume that focusin
    // without a mousedown means keyboard navigation
    addEventListener.call(elm, 'focusin', focusInEventHandler);
}

export function ignoreFocusIn(elm: HTMLElement) {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(tabIndexGetter.call(elm) !== -1, `Invalid attempt to ignore focus in  ${toString(elm)}. ${toString(elm)} should not have tabIndex -1`);
    }
    removeEventListener.call(elm, 'focusin', focusInEventHandler);
    removeEventListener.call(elm, 'mousedown', handleFocusMouseDown, true);
}

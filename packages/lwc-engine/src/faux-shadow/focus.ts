import assert from "../shared/assert";
import { querySelectorAll, getBoundingClientRect, addEventListener, removeEventListener } from './element';
import { DOCUMENT_POSITION_CONTAINED_BY, compareDocumentPosition, DOCUMENT_POSITION_PRECEDING, DOCUMENT_POSITION_FOLLOWING } from './node';
import { ArraySlice, ArrayIndexOf, isFalse, isNull, getOwnPropertyDescriptor } from '../shared/language';
import { DocumentPrototypeActiveElement, querySelectorAll as documentQuerySelectorAll } from './document';
import { eventCurrentTargetGetter, eventTargetGetter } from './events';
import { getShadowRoot } from './shadow-root';

const PossibleFocusableElementQuery = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const focusEventRelatedTargetGetter: (this: FocusEvent) => EventTarget | null = getOwnPropertyDescriptor(FocusEvent.prototype, 'relatedTarget')!.get!;

function isVisible(element: HTMLElement): boolean {
    const { width, height } = getBoundingClientRect.call(element);
    const noZeroSize = width > 0 || height > 0;
    return (
        noZeroSize &&
        getComputedStyle(element).visibility !== 'hidden'
    );
}

function isActive(element: HTMLElement): boolean {
    if ('disabled' in element) {
        return isFalse((element as any).disabled); // button elements
    }

    if ('href' in element) {
        return (element as any).href !== ''; // anchor elements
    }
    return true; // anything else with a tabindex === 0 (eg, span)
}

function isFocusable(element: HTMLElement): boolean {
    return (element.tabIndex >= 0 && isActive(element) && isVisible(element));
}

function getFirstFocusableMatch(elements: HTMLElement[]): HTMLElement | null {
    for (let i = 0, len = elements.length; i < len; i += 1) {
        const elm = elements[i];
        if (isFocusable(elm)) {
            return elm;
        }
    }
    return null;
}

function getLastFocusableMatch(elements: HTMLElement[]): HTMLElement | null {
    for (let i = elements.length - 1; i >= 0; i -= 1) {
        const elm = elements[i];
        if (isFocusable(elm)) {
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

function getFocusableSegments(host: HTMLElement): QuerySegments {
    const all = documentQuerySelectorAll.call(document, PossibleFocusableElementQuery);
    const inner = querySelectorAll.call(host, PossibleFocusableElementQuery);
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(inner.length > 0, `When focusin event is received, there has to be a focusable target at least.`);
        assert.invariant(host.tabIndex === -1, `The focusin event is only relevant when the tabIndex property is -1 on the host.`);
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

export function getFirstFocusableElement(host: HTMLElement): HTMLElement | null {
    const local = querySelectorAll.call(host, PossibleFocusableElementQuery);
    return getFirstFocusableMatch(local);
}

export function getActiveElement(host: HTMLElement): HTMLElement | null {
    const activeElement = DocumentPrototypeActiveElement.call(document);
    if (isNull(activeElement)) {
        return activeElement;
    }
    // activeElement must be child of the host and owned by it
    return (compareDocumentPosition.call(host, activeElement) & DOCUMENT_POSITION_CONTAINED_BY) !== 0 ? activeElement : null;
}

export function isDelegatingFocus(host: HTMLElement): boolean {
    const shadowRoot = getShadowRoot(host);
    return shadowRoot.delegatesFocus;
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

function getPreviousFocusableElement(segments: QuerySegments): HTMLElement | null {
    const { prev } = segments;
    return getFirstFocusableMatch(Array.prototype.reverse.call(prev));
}

function getNextFocusableElement(segments: QuerySegments): HTMLElement | null {
    const { next } = segments;
    return getFirstFocusableMatch(next);
}

function focusOnNextOrBlur(focusEventTarget: EventTarget, segments: QuerySegments) {
    const nextNode = getNextFocusableElement(segments);
    if (isNull(nextNode)) {
        // nothing to focus on, blur to invalidate the operation
        (focusEventTarget as HTMLElement).blur();
        return;
    }
    nextNode.focus();
}

function focusOnPrevOrBlur(focusEventTarget: EventTarget, segments: QuerySegments) {
    const prevNode = getPreviousFocusableElement(segments);
    if (isNull(prevNode)) {
        // nothing to focus on, blur to invalidate the operation
        (focusEventTarget as HTMLElement).blur();
        return;
    }
    prevNode.focus();
}

function isFirstFocusableChild(target: EventTarget, segments: QuerySegments): boolean {
    return getFirstFocusableMatch(segments.inner) === target;
}

function isLastFocusableChild(target: EventTarget, segments: QuerySegments): boolean {
    return getLastFocusableMatch(segments.inner) === target;
}

function focusInEventHandler(event: FocusEvent) {
    const host: EventTarget = eventCurrentTargetGetter.call(event);
    const target: EventTarget = eventTargetGetter.call(event);
    const relatedTarget: EventTarget = focusEventRelatedTargetGetter.call(event);
    const segments = getFocusableSegments(host as HTMLElement);
    const isFirstFocusableChildReceivingFocus = isFirstFocusableChild(target, segments);
    const isLastFocusableChildReceivingFocus = isLastFocusableChild(target, segments);
    if (isFalse(isFirstFocusableChildReceivingFocus) && isFalse(isLastFocusableChildReceivingFocus)) {
        // the focus is definitely not a result of tab or shift-tab interaction
        return;
    }
    if (isNull(relatedTarget)) {
        // could be a direct click, or entering the page from the url bar, etc.
        if (isFirstFocusableChildReceivingFocus) {
            // it is very likely that it is coming from above
            if (segments.prev.length === 0) {
                // since the host is the first tabbable element of the page
                // the focus is almost certain that it is a tab action, so we
                // must skip.
                focusOnNextOrBlur(target, segments);
                /**
                 * note: false positive here is when the user is clicking
                 * directly on the first focusable element of the page when
                 * this element is wrapped by a custom element that has
                 * delegatesFocus and tabindex="-1", this is very very rare, e.g.:
                 * <body>
                 *   <x-foo tabindex="-1">
                 *     #shadowRoot(delegatesFocus=true)
                 *       <input />  <--- user clicks here instead of tabbing
                 *   ... some content with other focusable elements
                 **/
            }
            return;
        } else {
            // it is very likely that it is coming from below
            if (segments.next.length === 0) {
                // since the host is the last tabbable element of the page
                // the focus is almost certain that it is a shift-tab action, so we
                // must skip.
                focusOnPrevOrBlur(target, segments);
                /**
                 * note: false positive here is when the user is clicking
                 * directly on the last focusable element of the page when
                 * this element is wrapped by a custom element that has
                 * delegatesFocus and tabindex="-1", this is very very rare, e.g.:
                 * <body>
                 *   ... some content with other focusable elements
                 *   <x-foo tabindex="-1">
                 *     #shadowRoot(delegatesFocus=true)
                 *       <input />  <--- user clicks here instead of tabbing
                 **/
            }
        }
        return; // do nothing, it is definitely not a tab
    }
    // If there is a related target, everything is easier
    const post = relatedTargetPosition(host as HTMLElement, relatedTarget as HTMLElement);
    switch (post) {
        case 1:
            // focus is probably coming from above
            if (isFirstFocusableChildReceivingFocus && relatedTarget === getPreviousFocusableElement(segments)) {
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
            if (isLastFocusableChildReceivingFocus && relatedTarget === getNextFocusableElement(segments)) {
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

export function handleFocusIn(elm: HTMLElement) {
    // TODO: assert that elm has tabindex attribute set to -1
    addEventListener.call(elm, 'focusin', focusInEventHandler);
}

export function ignoreFocusIn(elm: HTMLElement) {
    // TODO: assert that elm should have tabindex attribute set to something other than -1
    removeEventListener.call(elm, 'focusin', focusInEventHandler);
}

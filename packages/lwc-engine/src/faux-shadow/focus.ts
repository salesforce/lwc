import { querySelectorAll, getBoundingClientRect, addEventListener, removeEventListener } from './element';
import { DOCUMENT_POSITION_CONTAINED_BY, compareDocumentPosition, DOCUMENT_POSITION_PRECEDING, DOCUMENT_POSITION_FOLLOWING } from './node';
import { ArraySlice, ArrayIndexOf, isFalse, isNull, getOwnPropertyDescriptor } from '../shared/language';
import { DocumentPrototypeActiveElement } from './document';
import { eventCurrentTargetGetter } from './events';
import { getHost, getShadowRoot } from './shadow-root';

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
    const res =
        ("disabled" in element && isFalse((element as any).disabled)) ||
        ("href" in element && (element as any).href);
    return res;
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

function getFocusableSegments(host: HTMLElement): Record<string, HTMLElement[]> {
    const all = querySelectorAll.call(document, PossibleFocusableElementQuery);
    const local = querySelectorAll.call(host, PossibleFocusableElementQuery);
    // TODO: assert, local should have at least one element, otherwise why are we here?
    // TODO: assert, host should have tabindex -1, otherwise why are we here?
    const firstChild = local[0];
    const lastChild = local[local.length - 1];
    const prev = ArraySlice.call(all, 0, ArrayIndexOf.call(all, firstChild) - 1);
    const next = ArraySlice.call(all, ArrayIndexOf.call(all, lastChild));
    return {
        prev,
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

function getPreviousFocusableElement(host: HTMLElement): HTMLElement | null {
    const { prev } = getFocusableSegments(host);
    return getFirstFocusableMatch(Array.prototype.reverse.call(prev));
}

function getNextFocusableElement(host: HTMLElement): HTMLElement | null {
    const { next } = getFocusableSegments(host);
    return getFirstFocusableMatch(next);
}

function focusInEventHandler(event: FocusEvent) {
    const host: EventTarget = eventCurrentTargetGetter.call(event);
    const relatedTarget: EventTarget = focusEventRelatedTargetGetter.call(event);
    const post = relatedTargetPosition(host as HTMLElement, relatedTarget as HTMLElement);
    switch (post) {
        case 1:
            // focus is coming from above, so, set it to the next
            const nextNode = getNextFocusableElement(host as HTMLElement);
            if (!isNull(nextNode)) {
                nextNode.focus();
            } else {
                // TODO: what should we do when we have no next element?
            }
            break;
        case 2:
            // focus is coming from below, so, set it to the prev
            const prevNode = getPreviousFocusableElement(host as HTMLElement);
            if (!isNull(prevNode)) {
                prevNode.focus();
            } else {
                // TODO: what should we do when we have no next element?
            }
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

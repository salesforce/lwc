import { api, LightningElement } from 'lwc';

/**
 *
 * Returns all tabbable elements within a containing element. Tabbable elements are:
 * a visible/non-disabled element that has a tabIndex of 0 and is not within a custom
 * element with tabindex attribute of “-1" on it.
 *
 * @param {Element} container The element to search for tabbable element.
 * @returns {Array} Tabbable elements.
 */
export function findAllTabbableElements(container) {
    const result = [];

    traverseActiveTreeRecursively(container, element => {
        // Remove the try/catch once https://github.com/salesforce/lwc/issues/1421 is fixed
        try {
            if (isTabbable({ element, rootContainer: container })) {
                result.push(element);
            }
        } catch (e) {
            console.warn(e);
        }
    });
    return result;
}

const FOCUSABLE_NODES = /^input$|^select$|^textarea$|^a$|^button$/;

/**
 * Returns all focusable nodes within a containing element. Focusable nodes are
 * those which have a focus() method specified in the object definition spec:
 * https://www.w3.org/TR/DOM-Level-2-HTML/html.html
 *
 * Exception: button - Browsers today allow setting focus programmatically
 * on button elements + autofocus attribute present on HTMLButtonElement
 *
 * @param {Element} container The element to search for focusable nodes.
 * @returns {Array} Focusable elements.
 */
export function findAllFocusableNodes(container) {
    const result = [];
    traverseActiveTreeRecursively(container, element => {
        if (FOCUSABLE_NODES.test(element.tagName.toLowerCase())) {
            result.push(element);
        }
    });
    return result;
}

/**
 * Finds the element that currently has focus, even when the element is part of a shadow root or iframe.
 *
 * @returns {Element} Element that has focus.
 */
export function getElementWithFocus() {
    let currentFocusedElement = document.activeElement;
    while (currentFocusedElement) {
        if (currentFocusedElement.shadowRoot) {
            let nextFocusedElement =
                currentFocusedElement.shadowRoot.activeElement;
            if (nextFocusedElement) {
                currentFocusedElement = nextFocusedElement;
            } else {
                return currentFocusedElement;
            }
        } else if (currentFocusedElement.contentDocument) {
            let nextFocusedElement =
                currentFocusedElement.contentDocument.activeElement;
            if (nextFocusedElement) {
                currentFocusedElement = nextFocusedElement;
            } else {
                return currentFocusedElement;
            }
        } else {
            return currentFocusedElement;
        }
    }

    return undefined;
}

/**
 * Recursively traverse an active tree and run callback on each non-inert node element.
 *
 * @param {Node} node The starting node to recursively traverse.
 * @param {Function} callback Function to call on each node element.
 */
function traverseActiveTreeRecursively(node, callback) {
    if (!node) {
        return;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
        // inert is only supported by Chrome for now (behind a flag)
        if (node.hasAttribute('inert')) {
            return;
        }
        if (isIframe(node)) {
            if (isIframeOfSameOrigin(node)) {
                // for a same-origin iframe, we don't want to include the
                // iframe itself in the list, since we can see any of the
                // frames focusable children. So, skip calling callback on
                // the iframe node, and proceed to traverse it's children.
                traverseActiveTreeRecursively(node.contentDocument, callback);
            } else {
                // a non same-origin iframe is totally opaque, so include the
                // iframe in the results, but do no try to traverse into the
                // iframes children
                if (callback) {
                    callback(node);
                }
            }
            return;
        }
        if (callback) {
            callback(node);
        }
        // If the element has a shadow root, traverse that
        if (node.shadowRoot) {
            traverseActiveTreeRecursively(node.shadowRoot, callback);
            return;
        }
        // if it's a slot element, get all assigned nodes and traverse them
        if (node.localName === 'slot') {
            const slottedNodes = node.assignedNodes({ flatten: true });
            for (let i = 0; i < slottedNodes.length; i++) {
                traverseActiveTreeRecursively(slottedNodes[i], callback);
            }
            return;
        }
    }
    let child = node.firstChild;
    while (child !== null) {
        traverseActiveTreeRecursively(child, callback);
        child = child.nextSibling;
    }
}

// returns true if iframe is same origin, and therefore, can focus its internal elements
function isIframe(node) {
    return node.tagName === 'IFRAME' || node instanceof HTMLIFrameElement;
}

function isIframeOfSameOrigin(iframe) {
    // if we can access contentDocument (is not null) on the iframe, then it is of same origin
    return !!iframe.contentDocument;
}

const ELEMENTS_WITH_DISABLED_ATTRIBUTE = [
    'button',
    'select',
    'textarea',
    'input',
];

// https://html.spec.whatwg.org/multipage/interaction.html#dom-tabindex
const ELEMENTS_WITH_TABINDEX_ZERO_BY_DEFAULT = [
    'a',
    'select',
    'textarea',
    'input',
    'button',
    'iframe',
    'object',
    'area',
    'frame',
];

function isTabbable({ element, rootContainer }) {
    const elementLocalName = element.localName;

    if (elementLocalName === 'input' && elementLocalName.type === 'hidden') {
        return false;
    }

    const tabIndexAttribute = element.getAttribute('tabindex');
    if (tabIndexAttribute === '-1') {
        return false;
    }

    if (
        element.disabled &&
        ELEMENTS_WITH_DISABLED_ATTRIBUTE.includes(element.localName)
    ) {
        return false;
    }

    // Either the attribute was set directly to '0' or it's an element that has tabIndex zero by default
    const hasTabIndexZero =
        tabIndexAttribute === '0' ||
        (element.tabIndex === 0 &&
            ELEMENTS_WITH_TABINDEX_ZERO_BY_DEFAULT.includes(element.localName));

    return (
        hasTabIndexZero &&
        isElementVisible(element) &&
        isParentCustomElementTabbable({ element, rootContainer })
    );
}

function isElementVisible(element) {
    const { width, height } = element.getBoundingClientRect();
    const nonZeroSize = width > 0 || height > 0;
    return nonZeroSize && getComputedStyle(element).visibility !== 'hidden';
}

function isParentCustomElementTabbable({ element, rootContainer }) {
    const parentRoot = rootContainer.getRootNode();
    const ownerDocument = element.ownerDocument;
    let root = element.getRootNode();
    while (root !== parentRoot && root !== ownerDocument) {
        const host = root.host;
        if (host.getAttribute('tabindex') === '-1') {
            return false;
        }
        root = host && host.getRootNode();
    }
    return true;
}

export default class FocusTrap extends LightningElement {
    static delegatesFocus = true;

    _startNode;
    _endNode;

    _focused = false;
    _initialized = false;
    _pendingFocusOut = false;

    renderedCallback() {
        if (!this._initialized) {
            this._initialized = true;

            this._startNode = this.template.querySelector('[data-start]');
            this._endNode = this.template.querySelector('[data-end]');
        }
    }

    /**
     * Focuses the first focusable element in the focus trap.
     */
    @api
    focus() {
        if (!this._focused) {
            // We could potentially add support for focusing the element that has 'autofocus' attribute on it,
            // and if none, then focus on the first element
            this._focusFirstElement();
        }
    }

    get _bookendTabIndex() {
        return this._focused ? '0' : '-1';
    }

    _handleFocusIn() {
        if (this._pendingFocusOut) {
            this._pendingFocusOut = false;
        }
        this._focused = true;
    }

    _handleFocusOut() {
        // This assumes that a focusin will be dispatched after a focusout
        this._pendingFocusOut = true;
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        requestAnimationFrame(() => {
            if (this._pendingFocusOut) {
                this._focused = false;
            }
        });
    }

    /**
     * Focuses on the specified element location.
     * @param {String} elementLocation Could be 'first or 'last'.
     */
    _moveFocusTo(elementLocation) {
        const focusableElements = this._getFocusableElements();
        if (focusableElements.length > 0) {
            let node;
            if (elementLocation === 'last') {
                node = focusableElements[focusableElements.length - 1];
            } else if (elementLocation === 'first') {
                node = focusableElements[0];
            }
            node.focus();
        }
    }

    /**
     * Focuses the last focusable element in the focus trap.
     */
    _focusFirstElement() {
        this._moveFocusTo('first');
    }

    /**
     * Focuses the last focusable element in the focus trap.
     */
    _focusLastElement() {
        this._moveFocusTo('last');
    }

    /**
     * Returns a list of the focusable children found within the element.
     */
    _getFocusableElements() {
        return findAllTabbableElements(this.template.querySelector('slot'));
    }
}
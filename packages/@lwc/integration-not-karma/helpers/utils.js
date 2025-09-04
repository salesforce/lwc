/*
 * An as yet uncategorized mishmash of helpers, relics of Karma
 */
import * as LWC from 'lwc';
export { spyConsole } from './console.js';
export {
    DISABLE_OBJECT_REST_SPREAD_TRANSFORMATION,
    ENABLE_ELEMENT_INTERNALS_AND_FACE,
    ENABLE_THIS_DOT_HOST_ELEMENT,
    ENABLE_THIS_DOT_STYLE,
    IS_SYNTHETIC_SHADOW_LOADED,
    LOWERCASE_SCOPE_TOKENS,
    TEMPLATE_CLASS_NAME_OBJECT_BINDING,
    USE_COMMENTS_FOR_FRAGMENT_BOOKENDS,
    USE_FRAGMENTS_FOR_LIGHT_DOM_SLOTS,
    USE_LIGHT_DOM_SLOT_FORWARDING,
} from './constants.js';
export { addTrustedSignal } from './signals.js';

// Listen for errors thrown directly by the callback
function directErrorListener(callback) {
    try {
        callback();
    } catch (error) {
        return error;
    }
}

// Listen for errors using window.addEventListener('error')
function windowErrorListener(callback) {
    let error;
    function onError(event) {
        event.preventDefault(); // don't log the error
        error = event.error;
    }

    // Prevent jasmine from handling the global error. There doesn't seem to be another
    // way to disable this behavior: https://github.com/jasmine/jasmine/pull/1860
    const originalOnError = window.onerror;
    window.onerror = null;
    window.addEventListener('error', onError);

    try {
        callback();
    } finally {
        window.onerror = originalOnError;
        window.removeEventListener('error', onError);
    }
    return error;
}

// For errors we expect to be thrown in the connectedCallback() phase
// of a custom element, there are two possibilities:
// 1) We're using non-native lifecycle callbacks, so the error is thrown synchronously
// 2) We're using native lifecycle callbacks, so the error is thrown asynchronously and can
//    only be caught with window.addEventListener('error')
//      - Note native lifecycle callbacks are all thrown asynchronously.
export function customElementCallbackReactionErrorListener(callback) {
    return lwcRuntimeFlags.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE
        ? directErrorListener(callback)
        : windowErrorListener(callback);
}

/**
 *
 * @param dispatcher
 * @param runtimeEvents List of runtime events to filter by. If no list is provided, all events will be dispatched.
 */
export function attachReportingControlDispatcher(dispatcher, runtimeEvents) {
    LWC.__unstable__ReportingControl.attachDispatcher((eventName, payload) => {
        if (!runtimeEvents || runtimeEvents.includes(eventName)) {
            dispatcher(eventName, payload);
        }
    });
}

export function detachReportingControlDispatcher() {
    LWC.__unstable__ReportingControl.detachDispatcher();
}

export function extractDataIds(root) {
    const nodes = {};

    function processElement(elm) {
        if (elm.hasAttribute('data-id')) {
            nodes[elm.getAttribute('data-id')] = elm;
        }

        if (elm.shadowRoot) {
            Object.assign(nodes, extractShadowDataIds(elm.shadowRoot));
        }
    }

    function acceptNode() {
        return NodeFilter.FILTER_ACCEPT;
    }

    // Work around Internet Explorer wanting a function instead of an object. IE also *requires* this argument where
    // other browsers don't.
    const safeFilter = acceptNode;
    safeFilter.acceptNode = acceptNode;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, safeFilter, false);

    processElement(root);

    let elm;
    while ((elm = walker.nextNode())) {
        processElement(elm);
    }

    return nodes;
}

export function extractShadowDataIds(shadowRoot) {
    const nodes = {};

    // Add the shadow root here even if they don't have [data-id] attributes. This reference is
    // subsequently used to add event listeners.
    const dataId = shadowRoot.host.getAttribute('data-id');
    if (dataId) {
        nodes[dataId + '.shadowRoot'] = shadowRoot;
    }

    // We can't use a TreeWalker directly on the ShadowRoot since with synthetic shadow the ShadowRoot is not an
    // actual DOM nodes. So we need to iterate over the children manually and run the tree walker on each child.
    for (let i = 0; i < shadowRoot.childNodes.length; i++) {
        const child = shadowRoot.childNodes[i];
        Object.assign(nodes, extractDataIds(child));
    }

    return nodes;
}

let register = {};
export function load(id) {
    return Promise.resolve(register[id]);
}

export function registerForLoad(name, Ctor) {
    register[name] = Ctor;
}
export function clearRegister() {
    register = {};
}

// #986 - childNodes on the host element returns a fake shadow comment node on IE11 for debugging purposes. This method
// filters this node.
export function getHostChildNodes(host) {
    return Array.prototype.slice.call(host.childNodes).filter(function (n) {
        return !(n.nodeType === Node.COMMENT_NODE && n.tagName.startsWith('#shadow-root'));
    });
}

export function isSyntheticShadowRootInstance(sr) {
    return Boolean(sr && sr.synthetic);
}

export function isNativeShadowRootInstance(sr) {
    return Boolean(sr && !sr.synthetic);
}

// Keep traversing up the prototype chain until a property descriptor is found
export function getPropertyDescriptor(object, prop) {
    do {
        const descriptor = Object.getOwnPropertyDescriptor(object, prop);
        if (descriptor) {
            return descriptor;
        }
        object = Object.getPrototypeOf(object);
    } while (object);
}

// Designed for hydration tests, this helper asserts certain error/warn console messages were logged
function createExpectConsoleCallsFunc(devOnly) {
    return (consoleCalls, methods) => {
        for (const [method, matchers] of Object.entries(methods)) {
            const calls = consoleCalls[method];
            if (devOnly && process.env.NODE_ENV === 'production') {
                // assume no console errors/warnings in production
                expect(calls).toHaveSize(0);
            } else {
                expect(calls).toHaveSize(matchers.length);
                for (let i = 0; i < matchers.length; i++) {
                    const matcher = matchers[i];
                    const args = calls[i];
                    const argsString = args.map((arg) => stringifyArg(arg)).join(' ');
                    expect(argsString).toMatch(matcher);
                }
            }
        }
    };
}

// Browsers render nodes differently (class order, etc).
function stringifyArg(arg) {
    if (arg instanceof Array) {
        return arg.map((v) => stringifyArg(v));
    } else if (arg?.tagName) {
        return `<${arg.tagName.toLowerCase()}>`;
    } else if (arg?.nodeName) {
        return arg.nodeName;
    } else if (typeof arg === 'string') {
        // Avoids adding newlines in the matchers
        return arg.replaceAll('\n', '');
    } else {
        return arg;
    }
}

export const expectConsoleCalls = createExpectConsoleCallsFunc(false);
export const expectConsoleCallsDev = createExpectConsoleCallsFunc(true);

// Utility to handle unhandled rejections or errors without allowing Jasmine to handle them first.
// Captures both onunhandledrejection and onerror events, since you might want both depending on
// native vs synthetic lifecycle timing differences.
export function catchUnhandledRejectionsAndErrors(onUnhandledRejectionOrError) {
    let originalOnError;

    const onError = (e) => {
        e.preventDefault(); // Avoids logging to the console
        onUnhandledRejectionOrError(e);
    };

    const onRejection = (e) => {
        // Avoids logging the error to the console, except in Firefox sadly https://bugzilla.mozilla.org/1642147
        e.preventDefault();
        onUnhandledRejectionOrError(e.reason);
    };

    beforeEach(() => {
        // Overriding window.onerror disables Jasmine's global error handler, so we can listen for errors
        // ourselves. There doesn't seem to be a better way to disable Jasmine's behavior here.
        // https://github.com/jasmine/jasmine/pull/1860
        originalOnError = window.onerror;
        // Dummy onError because Jasmine tries to call it in case of a rejection:
        // https://github.com/jasmine/jasmine/blob/169a2a8/src/core/GlobalErrors.js#L104-L106
        window.onerror = () => {};
        window.addEventListener('error', onError);
        window.addEventListener('unhandledrejection', onRejection);
    });

    afterEach(() => {
        window.removeEventListener('error', onError);
        window.removeEventListener('unhandledrejection', onRejection);
        window.onerror = originalOnError;
    });
}

// Succeeds if the given DOM element is equivalent to the given HTML in terms of nodes and elements. This is
// basically the same as `expect(element.outerHTML).toBe(html)` except that it works despite bugs in synthetic shadow.
export function expectEquivalentDOM(element, html) {
    const fragment = Document.parseHTMLUnsafe(html);

    // When the fragment is parsed, the string "abc" is considered one text node. Whereas the engine
    // may have produced it as three adjacent text nodes: "a", "b", "c". We want to consider these equivalent
    // for the purposes of diffing
    function concatenateAdjacentTextNodes(nodes) {
        const result = [];
        for (const node of nodes) {
            const lastNode = result[result.length - 1];
            if (node.nodeType === Node.TEXT_NODE && lastNode?.nodeType === Node.TEXT_NODE) {
                const newLastNode = (result[result.length - 1] = lastNode.cloneNode(true));
                newLastNode.nodeValue += node.nodeValue;
            } else {
                result.push(node);
            }
        }
        return result;
    }

    function expectEquivalent(a, b) {
        if (!a || !b) {
            // null/undefined
            expect(a).toBe(b);
            return;
        }

        expect(a.tagName).toBe(b.tagName);
        expect(a.nodeType).toBe(b.nodeType);
        if (a.nodeType === Node.TEXT_NODE || a.nodeType === Node.COMMENT_NODE) {
            expect(a.textContent).toBe(b.textContent);
        }

        // attrs
        if (a.nodeType === Node.ELEMENT_NODE && b.nodeType === Node.ELEMENT_NODE) {
            expect(a.attributes.length).toBe(b.attributes.length);
            for (const { name, value } of a.attributes) {
                expect(b.getAttribute(name)).toBe(value);
            }
        }

        // child nodes (recursive)
        const aChildNodes = concatenateAdjacentTextNodes(a.childNodes);
        const bChildNodes = concatenateAdjacentTextNodes(b.childNodes);
        expect(aChildNodes.length).toBe(bChildNodes.length);
        for (let i = 0; i < aChildNodes.length; i++) {
            expectEquivalent(aChildNodes[i], bChildNodes[i]);
        }

        // shadow root (recursive)
        expectEquivalent(a.shadowRoot, b.shadowRoot);
    }

    expect(fragment.body.childNodes.length).toBe(1); // only supports one top-level element

    expectEquivalent(element, fragment.body.firstChild);
}

/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

window.TestUtils = (function (lwc, jasmine, beforeAll) {
    function pass() {
        return {
            pass: true,
        };
    }

    function fail(message) {
        return {
            pass: false,
            message: message,
        };
    }

    // TODO [#869]: Replace this custom spy with standard spyOn jasmine spy when logWarning doesn't use console.group
    // anymore. On IE11 console.group has a different behavior when the F12 inspector is attached to the page.
    function spyConsole() {
        const originalConsole = window.console;

        const calls = {
            log: [],
            warn: [],
            error: [],
            group: [],
            groupEnd: [],
        };

        window.console = {
            log: function () {
                calls.log.push(Array.prototype.slice.call(arguments));
            },
            warn: function () {
                calls.warn.push(Array.prototype.slice.call(arguments));
            },
            error: function () {
                calls.error.push(Array.prototype.slice.call(arguments));
            },
            group: function () {
                calls.group.push(Array.prototype.slice.call(arguments));
            },
            groupEnd: function () {
                calls.groupEnd.push(Array.prototype.slice.call(arguments));
            },
        };

        return {
            calls: calls,
            reset: function () {
                window.console = originalConsole;
            },
        };
    }

    function formatConsoleCall(args) {
        return args.map(String).join(' ');
    }

    // TODO [#869]: Improve lookup logWarning doesn't use console.group anymore.
    function consoleDevMatcherFactory(methodName, expectInProd) {
        return function consoleDevMatcher() {
            return {
                negativeCompare: function negativeCompare(actual) {
                    const spy = spyConsole();
                    try {
                        actual();
                    } finally {
                        spy.reset();
                    }

                    const callsArgs = spy.calls[methodName];
                    const formattedCalls = callsArgs
                        .map(function (arg) {
                            return '"' + formatConsoleCall(arg) + '"';
                        })
                        .join(', ');

                    if (callsArgs.length === 0) {
                        return {
                            pass: true,
                        };
                    }
                    return {
                        pass: false,
                        message: function () {
                            return 'Expect no message but received:\n' + formattedCalls;
                        },
                    };
                },
                compare: function compare(actual, expectedMessages) {
                    function matchMessage(message, expectedMessage) {
                        if (typeof expectedMessage === 'string') {
                            return message === expectedMessage;
                        } else {
                            return expectedMessage.test(message);
                        }
                    }

                    if (!Array.isArray(expectedMessages)) {
                        expectedMessages = [expectedMessages];
                    }

                    if (typeof actual !== 'function') {
                        throw new Error('Expected function to throw error.');
                    } else if (
                        expectedMessages.some(function (message) {
                            return typeof message !== 'string' && !(message instanceof RegExp);
                        })
                    ) {
                        throw new Error(
                            'Expected a string or a RegExp to compare the thrown error against, or an array of such.'
                        );
                    }

                    const spy = spyConsole();

                    try {
                        actual();
                    } finally {
                        spy.reset();
                    }

                    const callsArgs = spy.calls[methodName];
                    const formattedCalls = callsArgs
                        .map(function (callArgs) {
                            return '"' + formatConsoleCall(callArgs) + '"';
                        })
                        .join(', ');

                    if (!expectInProd && process.env.NODE_ENV === 'production') {
                        if (callsArgs.length !== 0) {
                            return fail(
                                'Expected console.' +
                                    methodName +
                                    ' to never called in production mode, but it was called ' +
                                    callsArgs.length +
                                    ' with ' +
                                    formattedCalls +
                                    '.'
                            );
                        } else {
                            return pass();
                        }
                    } else {
                        if (callsArgs.length === 0) {
                            return fail(
                                'Expected console.' +
                                    methodName +
                                    ' to called with ' +
                                    JSON.stringify(expectedMessages) +
                                    ', but was never called.'
                            );
                        } else {
                            if (callsArgs.length !== expectedMessages.length) {
                                return fail(
                                    'Expected console.' +
                                        methodName +
                                        ' to be called ' +
                                        expectedMessages.length +
                                        ' time(s), but was called ' +
                                        callsArgs.length +
                                        ' time(s).'
                                );
                            }
                            for (let i = 0; i < callsArgs.length; i++) {
                                const callsArg = callsArgs[i];
                                const expectedMessage = expectedMessages[i];
                                const actualMessage = formatConsoleCall(callsArg);
                                if (!matchMessage(actualMessage, expectedMessage)) {
                                    return fail(
                                        'Expected console.' +
                                            methodName +
                                            ' to be called with "' +
                                            expectedMessage +
                                            '", but was called with "' +
                                            actualMessage +
                                            '".'
                                    );
                                }
                            }
                            return pass();
                        }
                    }
                },
            };
        };
    }

    function errorMatcherFactory(errorListener, expectInProd) {
        return function toThrowError() {
            return {
                compare: function (actual, expectedErrorCtor, expectedMessage) {
                    function matchMessage(message) {
                        if (typeof expectedMessage === 'undefined') {
                            return true;
                        } else if (typeof expectedMessage === 'string') {
                            return message === expectedMessage;
                        } else {
                            return expectedMessage.test(message);
                        }
                    }

                    function matchError(error) {
                        return error instanceof expectedErrorCtor && matchMessage(error.message);
                    }

                    function throwDescription(thrown) {
                        return thrown.name + ' with message "' + thrown.message + '"';
                    }

                    if (typeof expectedMessage === 'undefined') {
                        if (typeof expectedErrorCtor === 'undefined') {
                            // 0 arguments provided
                            expectedMessage = undefined;
                            expectedErrorCtor = Error;
                        } else {
                            // 1 argument provided
                            expectedMessage = expectedErrorCtor;
                            expectedErrorCtor = Error;
                        }
                    }

                    if (typeof actual !== 'function') {
                        throw new Error('Expected function to throw error.');
                    } else if (
                        expectedErrorCtor !== Error &&
                        !(expectedErrorCtor.prototype instanceof Error)
                    ) {
                        throw new Error('Expected an error constructor.');
                    } else if (
                        typeof expectedMessage !== 'undefined' &&
                        typeof expectedMessage !== 'string' &&
                        !(expectedMessage instanceof RegExp)
                    ) {
                        throw new Error(
                            'Expected a string or a RegExp to compare the thrown error against.'
                        );
                    }

                    const thrown = errorListener(actual);

                    if (!expectInProd && process.env.NODE_ENV === 'production') {
                        if (thrown !== undefined) {
                            return fail(
                                'Expected function not to throw an error in production mode, but it threw ' +
                                    throwDescription(thrown) +
                                    '.'
                            );
                        } else {
                            return pass();
                        }
                    } else {
                        if (thrown === undefined) {
                            return fail(
                                'Expected function to throw an ' +
                                    expectedErrorCtor.name +
                                    ' error in development mode"' +
                                    (expectedMessage ? 'with message ' + expectedMessage : '') +
                                    '".'
                            );
                        } else if (!matchError(thrown)) {
                            return fail(
                                'Expected function to throw an ' +
                                    expectedErrorCtor.name +
                                    ' error in development mode "' +
                                    (expectedMessage ? 'with message ' + expectedMessage : '') +
                                    '", but it threw ' +
                                    throwDescription(thrown) +
                                    '.'
                            );
                        } else {
                            return pass();
                        }
                    }
                },
            };
        };
    }

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
    function customElementCallbackReactionErrorListener(callback) {
        return lwcRuntimeFlags.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE
            ? directErrorListener(callback)
            : windowErrorListener(callback);
    }

    const customMatchers = {
        toLogErrorDev: consoleDevMatcherFactory('error'),
        toLogError: consoleDevMatcherFactory('error', true),
        toLogWarningDev: consoleDevMatcherFactory('warn'),
        toThrowErrorDev: errorMatcherFactory(directErrorListener),
        toThrowCallbackReactionErrorDev: errorMatcherFactory(
            customElementCallbackReactionErrorListener
        ),
        toThrowCallbackReactionError: errorMatcherFactory(
            customElementCallbackReactionErrorListener,
            true
        ),
        toThrowCallbackReactionErrorEvenInSyntheticLifecycleMode: errorMatcherFactory(
            windowErrorListener,
            true
        ),
    };

    beforeAll(function () {
        jasmine.addMatchers(customMatchers);
    });

    /**
     *
     * @param dispatcher
     * @param runtimeEvents List of runtime events to filter by. If no list is provided, all events will be dispatched.
     */
    function attachReportingControlDispatcher(dispatcher, runtimeEvents) {
        lwc.__unstable__ReportingControl.attachDispatcher((eventName, payload) => {
            if (!runtimeEvents || runtimeEvents.includes(eventName)) {
                dispatcher(eventName, payload);
            }
        });
    }

    function detachReportingControlDispatcher() {
        lwc.__unstable__ReportingControl.detachDispatcher();
    }

    function extractDataIds(root) {
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

    function extractShadowDataIds(shadowRoot) {
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
    function load(id) {
        return Promise.resolve(register[id]);
    }

    function registerForLoad(name, Ctor) {
        register[name] = Ctor;
    }
    function clearRegister() {
        register = {};
    }

    // #986 - childNodes on the host element returns a fake shadow comment node on IE11 for debugging purposes. This method
    // filters this node.
    function getHostChildNodes(host) {
        return Array.prototype.slice.call(host.childNodes).filter(function (n) {
            return !(n.nodeType === Node.COMMENT_NODE && n.tagName.startsWith('#shadow-root'));
        });
    }

    function isSyntheticShadowRootInstance(sr) {
        return Boolean(sr && sr.synthetic);
    }

    function isNativeShadowRootInstance(sr) {
        return Boolean(sr && !sr.synthetic);
    }

    // Providing overridable hooks for tests
    let sanitizeHtmlContentHook = function () {
        throw new Error('sanitizeHtmlContent hook must be implemented.');
    };

    LWC.setHooks({
        sanitizeHtmlContent: function (content) {
            return sanitizeHtmlContentHook(content);
        },
    });

    function getHooks() {
        return {
            sanitizeHtmlContent: sanitizeHtmlContentHook,
        };
    }

    function setHooks(hooks) {
        if (hooks.sanitizeHtmlContent) {
            sanitizeHtmlContentHook = hooks.sanitizeHtmlContent;
        }
    }

    // This mapping should be kept up-to-date with the mapping in @lwc/shared -> aria.ts
    const ariaPropertiesMapping = {
        ariaAutoComplete: 'aria-autocomplete',
        ariaChecked: 'aria-checked',
        ariaCurrent: 'aria-current',
        ariaDisabled: 'aria-disabled',
        ariaExpanded: 'aria-expanded',
        ariaHasPopup: 'aria-haspopup',
        ariaHidden: 'aria-hidden',
        ariaInvalid: 'aria-invalid',
        ariaLabel: 'aria-label',
        ariaLevel: 'aria-level',
        ariaMultiLine: 'aria-multiline',
        ariaMultiSelectable: 'aria-multiselectable',
        ariaOrientation: 'aria-orientation',
        ariaPressed: 'aria-pressed',
        ariaReadOnly: 'aria-readonly',
        ariaRequired: 'aria-required',
        ariaSelected: 'aria-selected',
        ariaSort: 'aria-sort',
        ariaValueMax: 'aria-valuemax',
        ariaValueMin: 'aria-valuemin',
        ariaValueNow: 'aria-valuenow',
        ariaValueText: 'aria-valuetext',
        ariaLive: 'aria-live',
        ariaRelevant: 'aria-relevant',
        ariaAtomic: 'aria-atomic',
        ariaBusy: 'aria-busy',
        ariaActiveDescendant: 'aria-activedescendant',
        ariaControls: 'aria-controls',
        ariaDescribedBy: 'aria-describedby',
        ariaFlowTo: 'aria-flowto',
        ariaLabelledBy: 'aria-labelledby',
        ariaOwns: 'aria-owns',
        ariaPosInSet: 'aria-posinset',
        ariaSetSize: 'aria-setsize',
        ariaColCount: 'aria-colcount',
        ariaColSpan: 'aria-colspan',
        ariaColIndex: 'aria-colindex',
        ariaColIndexText: 'aria-colindextext',
        ariaDescription: 'aria-description',
        ariaDetails: 'aria-details',
        ariaErrorMessage: 'aria-errormessage',
        ariaKeyShortcuts: 'aria-keyshortcuts',
        ariaModal: 'aria-modal',
        ariaPlaceholder: 'aria-placeholder',
        ariaRoleDescription: 'aria-roledescription',
        ariaRowCount: 'aria-rowcount',
        ariaRowIndex: 'aria-rowindex',
        ariaRowIndexText: 'aria-rowindextext',
        ariaRowSpan: 'aria-rowspan',
        ariaBrailleLabel: 'aria-braillelabel',
        ariaBrailleRoleDescription: 'aria-brailleroledescription',
        role: 'role',
    };

    // See the README for @lwc/aria-reflection
    const nonStandardAriaProperties = [
        'ariaActiveDescendant',
        'ariaControls',
        'ariaDescribedBy',
        'ariaDetails',
        'ariaErrorMessage',
        'ariaFlowTo',
        'ariaLabelledBy',
        'ariaOwns',
    ];

    // These properties are not included in the global polyfill, but were added to LightningElement/BridgeElement
    // prototypes in https://github.com/salesforce/lwc/pull/3702
    const nonPolyfilledAriaProperties = [
        'ariaColIndexText',
        'ariaBrailleLabel',
        'ariaBrailleRoleDescription',
        'ariaDescription',
        'ariaRowIndexText',
    ];

    const ariaProperties = Object.keys(ariaPropertiesMapping);
    const ariaAttributes = Object.values(ariaPropertiesMapping);

    // Keep traversing up the prototype chain until a property descriptor is found
    function getPropertyDescriptor(object, prop) {
        do {
            const descriptor = Object.getOwnPropertyDescriptor(object, prop);
            if (descriptor) {
                return descriptor;
            }
            object = Object.getPrototypeOf(object);
        } while (object);
    }

    const IS_SYNTHETIC_SHADOW_LOADED = !`${ShadowRoot}`.includes('[native code]');

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
                        const call = calls[i][0];
                        const message = typeof call === 'string' ? call : call.message;
                        if (typeof matcher === 'string') {
                            expect(message).toContain(matcher);
                        } else {
                            expect(message).toMatch(matcher);
                        }
                    }
                }
            }
        };
    }

    const expectConsoleCalls = createExpectConsoleCallsFunc(false);
    const expectConsoleCallsDev = createExpectConsoleCallsFunc(true);

    // Utility to handle unhandled rejections or errors without allowing Jasmine to handle them first.
    // Captures both onunhandledrejection and onerror events, since you might want both depending on
    // native vs synthetic lifecycle timing differences.
    function catchUnhandledRejectionsAndErrors(onUnhandledRejectionOrError) {
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
    function expectEquivalentDOM(element, html) {
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

    // These values are based on the API versions in @lwc/shared/api-version
    const apiFeatures = {
        LOWERCASE_SCOPE_TOKENS: process.env.API_VERSION >= 59,
        USE_COMMENTS_FOR_FRAGMENT_BOOKENDS: process.env.API_VERSION >= 60,
        USE_FRAGMENTS_FOR_LIGHT_DOM_SLOTS: process.env.API_VERSION >= 60,
        DISABLE_OBJECT_REST_SPREAD_TRANSFORMATION: process.env.API_VERSION >= 60,
        ENABLE_ELEMENT_INTERNALS_AND_FACE: process.env.API_VERSION >= 61,
        USE_LIGHT_DOM_SLOT_FORWARDING: process.env.API_VERSION >= 61,
        ENABLE_THIS_DOT_HOST_ELEMENT: process.env.API_VERSION >= 62,
        ENABLE_THIS_DOT_STYLE: process.env.API_VERSION >= 62,
        TEMPLATE_CLASS_NAME_OBJECT_BINDING: process.env.API_VERSION >= 62,
    };

    const signalValidator = new WeakSet();
    lwc.setTrustedSignalSet(signalValidator);

    function addTrustedSignal(signal) {
        signalValidator.add(signal);
    }

    return {
        clearRegister,
        extractDataIds,
        extractShadowDataIds,
        getHostChildNodes,
        isNativeShadowRootInstance,
        isSyntheticShadowRootInstance,
        load,
        registerForLoad,
        getHooks,
        setHooks,
        spyConsole,
        customElementCallbackReactionErrorListener,
        ariaPropertiesMapping,
        ariaProperties,
        ariaAttributes,
        nonStandardAriaProperties,
        nonPolyfilledAriaProperties,
        getPropertyDescriptor,
        attachReportingControlDispatcher,
        detachReportingControlDispatcher,
        IS_SYNTHETIC_SHADOW_LOADED,
        expectConsoleCalls,
        expectConsoleCallsDev,
        catchUnhandledRejectionsAndErrors,
        addTrustedSignal,
        expectEquivalentDOM,
        ...apiFeatures,
    };
})(LWC, jasmine, beforeAll);

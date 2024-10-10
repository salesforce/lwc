/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

export { expect, describe, vi } from 'vitest';

export function expectComposedPath(
    event: Event,
    target: EventTarget,
    dispatcher: EventTarget = target
): Promise<EventTarget[]> {
    return new Promise((resolve) => {
        target.addEventListener(event.type, (event) => {
            resolve(event.composedPath());
        });

        dispatcher.dispatchEvent(event);
    });
}

type ConsoleMethods = keyof Omit<Console, 'Console'>;

type ConsoleCalls = {
    [K in ConsoleMethods]: any[];
} & {
    [key: string]: any[];
};

// TODO [#869]: Replace this custom spy with standard spyOn jasmine spy when logWarning doesn't use console.group
// anymore. On IE11 console.group has a different behavior when the F12 inspector is attached to the page.
export function spyConsole() {
    const originalConsole = window.console;

    const calls: ConsoleCalls = {
        log: [],
        warn: [],
        error: [],
        group: [],
        groupEnd: [],
        dir: [],
        assert: [],
        clear: [],
        count: [],
        countReset: [],
        debug: [],
        dirxml: [],
        groupCollapsed: [],
        info: [],
        table: [],
        time: [],
        timeEnd: [],
        timeLog: [],
        timeStamp: [],
        trace: [],
        profile: [],
        profileEnd: [],
    };

    // @ts-expect-error temporary override of console
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

    function reset() {
        window.console = originalConsole;
    }

    return {
        calls,
        reset,
    };
}

// Listen for errors thrown directly by the callback
export function directErrorListener(callback: () => void) {
    try {
        callback();
    } catch (error) {
        return error;
    }
}

// Listen for errors using window.addEventListener('error')
export function windowErrorListener(callback: () => void) {
    let error: unknown;
    function onError(event: ErrorEvent) {
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
export function customElementCallbackReactionErrorListener(callback: () => void) {
    return lwcRuntimeFlags.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE
        ? directErrorListener(callback)
        : windowErrorListener(callback);
}

// const customMatchers = {
//     toLogErrorDev: consoleDevMatcherFactory('error'),
//     toLogError: consoleDevMatcherFactory('error', true),
//     toLogWarningDev: consoleDevMatcherFactory('warn'),
//     toThrowErrorDev: errorMatcherFactory(directErrorListener),
//     toThrowCallbackReactionErrorDev: errorMatcherFactory(
//         customElementCallbackReactionErrorListener
//     ),
//     toThrowCallbackReactionError: errorMatcherFactory(
//         customElementCallbackReactionErrorListener,
//         true
//     ),
//     toThrowCallbackReactionErrorEvenInSyntheticLifecycleMode: errorMatcherFactory(
//         windowErrorListener,
//         true
//     ),
// } satisfies MatchersObject;

// beforeAll(function () {
//     expect.extend(customMatchers);
// });

export function extractDataIds(root: Element) {
    const nodes: Record<string, Node> = {};

    function processElement(elm: Element) {
        if (elm.hasAttribute('data-id')) {
            nodes[elm.getAttribute('data-id')!] = elm;
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
    // @ts-expect-error IE11 doesn't like the object form of the filter
    safeFilter.acceptNode = acceptNode;

    const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_ELEMENT,
        safeFilter,
        // @ts-expect-error IE11 doesn't like the object form of the filter
        false
    );

    processElement(root);

    let elm: Node | null;
    while ((elm = walker.nextNode())) {
        // @ts-expect-error IE11 doesn't like the object form of the filter
        processElement(elm);
    }

    return nodes;
}

export function extractShadowDataIds(shadowRoot: ShadowRoot) {
    const nodes: Record<string, Node> = {};

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
        Object.assign(
            nodes,
            // @ts-expect-error IE11 doesn't like the object form of the filter
            extractDataIds(child)
        );
    }

    return nodes;
}

let register: Record<string, CustomElementConstructor> = {};
export function load(id: string) {
    return Promise.resolve(register[id]);
}

export function registerForLoad(name: string, Ctor: CustomElementConstructor) {
    register[name] = Ctor;
}
export function clearRegister() {
    register = {};
}

// #986 - childNodes on the host element returns a fake shadow comment node on IE11 for debugging purposes. This method
// filters this node.
export function getHostChildNodes(host: Node) {
    return Array.prototype.slice.call(host.childNodes).filter(function (n) {
        return !(n.nodeType === Node.COMMENT_NODE && n.tagName.startsWith('#shadow-root'));
    });
}

export function isSyntheticShadowRootInstance(sr: ShadowRoot) {
    return Boolean(sr && (sr as any).synthetic);
}

export function isNativeShadowRootInstance(sr: ShadowRoot) {
    return Boolean(sr && !(sr as any).synthetic);
}

type OverridableHooksDef = Parameters<typeof import('lwc').setHooks>[0];
type SanitizeHtmlContentHook = OverridableHooksDef['sanitizeHtmlContent'];

//
let isOverriden = false;

// Providing overridable hooks for tests
let sanitizeHtmlContentHook: SanitizeHtmlContentHook = function () {
    throw new Error('sanitizeHtmlContent hook must be implemented.');
};

export function getHooks() {
    return {
        sanitizeHtmlContent: sanitizeHtmlContentHook,
    };
}

export function setHooks(hooks: OverridableHooksDef) {
    if (!isOverriden) {
        LWC.setHooks({
            sanitizeHtmlContent: function (content) {
                return sanitizeHtmlContentHook(content);
            },
        });
        isOverriden = true;
    }

    if (hooks.sanitizeHtmlContent) {
        sanitizeHtmlContentHook = hooks.sanitizeHtmlContent;
    }
}

// This mapping should be kept up-to-date with the mapping in @lwc/shared -> aria.ts
export const ariaPropertiesMapping = {
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
} as const;

// See the README for @lwc/aria-reflection
export const nonStandardAriaProperties = [
    'ariaActiveDescendant',
    'ariaControls',
    'ariaDescribedBy',
    'ariaDetails',
    'ariaErrorMessage',
    'ariaFlowTo',
    'ariaLabelledBy',
    'ariaOwns',
] as const;

// These properties are not included in the global polyfill, but were added to LightningElement/BridgeElement
// prototypes in https://github.com/salesforce/lwc/pull/3702
export const nonPolyfilledAriaProperties = [
    'ariaColIndexText',
    'ariaBrailleLabel',
    'ariaBrailleRoleDescription',
    'ariaDescription',
    'ariaRowIndexText',
] as const;

export const ariaProperties = Object.keys(ariaPropertiesMapping);
export const ariaAttributes = Object.values(ariaPropertiesMapping);

// Keep traversing up the prototype chain until a property descriptor is found
export function getPropertyDescriptor(object: unknown, prop: PropertyKey) {
    do {
        const descriptor = Object.getOwnPropertyDescriptor(object, prop);
        if (descriptor) {
            return descriptor;
        }
        object = Object.getPrototypeOf(object);
    } while (object);
}

export const IS_SYNTHETIC_SHADOW_LOADED = !`${ShadowRoot}`.includes('[native code]');

// Designed for hydration tests, this helper asserts certain error/warn console messages were logged
export function createExpectConsoleCallsFunc(devOnly: boolean) {
    return (consoleCalls: ConsoleCalls, methods: ConsoleCalls) => {
        for (const [method, matchers] of Object.entries(methods)) {
            const calls = consoleCalls[method];
            if (devOnly && process.env.NODE_ENV === 'production') {
                // assume no console errors/warnings in production
                expect(calls).toHaveLength(0);
            } else {
                expect(calls).toHaveLength(matchers.length);
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

export const expectConsoleCalls = createExpectConsoleCallsFunc(false);
export const expectConsoleCallsDev = createExpectConsoleCallsFunc(true);

// Utility to handle unhandled rejections or errors without allowing Jasmine to handle them first.
// Captures both onunhandledrejection and onerror events, since you might want both depending on
// native vs synthetic lifecycle timing differences.
export function catchUnhandledRejectionsAndErrors(
    onUnhandledRejectionOrError: (event: ErrorEvent) => void
) {
    let originalOnError: OnErrorEventHandler;

    const onError = (e: ErrorEvent) => {
        e.preventDefault(); // Avoids logging to the console
        onUnhandledRejectionOrError(e);
    };

    const onRejection = (e: PromiseRejectionEvent) => {
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

const apiVersion = process.env.API_VERSION ? parseInt(process.env.API_VERSION, 10) : 63;

// These values are based on the API versions in @lwc/shared/api-version

export const LOWERCASE_SCOPE_TOKENS = apiVersion >= 59;
export const USE_COMMENTS_FOR_FRAGMENT_BOOKENDS = apiVersion >= 60;
export const USE_FRAGMENTS_FOR_LIGHT_DOM_SLOTS = apiVersion >= 60;
export const DISABLE_OBJECT_REST_SPREAD_TRANSFORMATION = apiVersion >= 60;
export const ENABLE_ELEMENT_INTERNALS_AND_FACE = apiVersion >= 61;
export const USE_LIGHT_DOM_SLOT_FORWARDING = apiVersion >= 61;
export const ENABLE_THIS_DOT_HOST_ELEMENT = apiVersion >= 62;
export const ENABLE_THIS_DOT_STYLE = apiVersion >= 62;
export const TEMPLATE_CLASS_NAME_OBJECT_BINDING = apiVersion >= 62;

// const apiVersionNumber = process.env.API_VERSION
//     ? parseInt(process.env.API_VERSION, 10)
//     : undefined;
// const apiVersion = getAPIVersionFromNumber(apiVersionNumber);

// // These values are based on the API versions in @lwc/shared/api-version
// const apiFeatures = {
//     LOWERCASE_SCOPE_TOKENS: apiVersion >= APIVersion.V59_246_WINTER_24,
//     USE_COMMENTS_FOR_FRAGMENT_BOOKENDS: apiVersion >= APIVersion.V60_248_SPRING_24,
//     USE_FRAGMENTS_FOR_LIGHT_DOM_SLOTS: apiVersion >= APIVersion.V60_248_SPRING_24,
//     DISABLE_OBJECT_REST_SPREAD_TRANSFORMATION: apiVersion >= APIVersion.V60_248_SPRING_24,
//     ENABLE_ELEMENT_INTERNALS_AND_FACE: apiVersion >= APIVersion.V61_250_SUMMER_24,
//     USE_LIGHT_DOM_SLOT_FORWARDING: apiVersion >= APIVersion.V61_250_SUMMER_24,
//     ENABLE_THIS_DOT_HOST_ELEMENT: apiVersion >= APIVersion.V62_252_WINTER_25,
//     ENABLE_THIS_DOT_STYLE: apiVersion >= APIVersion.V62_252_WINTER_25,
//     TEMPLATE_CLASS_NAME_OBJECT_BINDING: apiVersion >= APIVersion.V62_252_WINTER_25,
// } as Partial<Record<keyof typeof APIFeature, boolean>>;

type AttachDispatcher = typeof import('lwc').__unstable__ReportingControl.attachDispatcher;
type ReportingDispatcher = Parameters<AttachDispatcher>[0];
type ReportingEventId = Parameters<ReportingDispatcher>[0];

/**
 *
 * @param dispatcher
 * @param runtimeEvents List of runtime events to filter by. If no list is provided, all events will be dispatched.
 */
export function attachReportingControlDispatcher(
    dispatcher: ReportingDispatcher,
    runtimeEvents: ReportingEventId[keyof ReportingEventId][]
) {
    LWC.__unstable__ReportingControl.attachDispatcher((eventName, payload) => {
        if (!runtimeEvents || runtimeEvents.includes(eventName)) {
            dispatcher(eventName, payload);
        }
    });
}

export function detachReportingControlDispatcher() {
    LWC.__unstable__ReportingControl.detachDispatcher();
}

const testUtils = {
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
} as const;

declare global {
    var TestUtils: typeof testUtils;

    interface ProcessEnv {
        API_VERSION: number;
    }
}

window.TestUtils = testUtils;

export default testUtils;

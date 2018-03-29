import assert from "../assert";
import { defineProperty, isUndefined, hasOwnProperty, getOwnPropertyNames, forEach, ArrayFilter, isNull, isFalse, create, defineProperties, isFunction, ArrayIndexOf, ArrayPush, ArraySplice } from "../language";
import { ViewModelReflection, ComponentDef } from "../def";
import { VM, isNodeOwnedByVM, OwnerKey } from "../vm";
import { getRootNode, compareDocumentPosition, DOCUMENT_POSITION_CONTAINED_BY } from "../dom/node";
import { removeAttribute, setAttribute, querySelectorAll, querySelector } from "../dom/element";
import { GlobalAOMProperties } from "./attributes";
import { getAttrNameFromPropName } from "../utils";
import { pierce, piercingHook } from "../piercing";
import { TargetSlot, Membrane, Replicable } from "../membrane";
import { Component } from "../component";
import { register } from "../services";
import { VNodeData } from "../../3rdparty/snabbdom/types";
import { Context } from "../context";
import { Event } from "./event";
import { invokeRootCallback, isRendering, vmBeingRendered } from "../invoker";

export const usesNativeShadowRoot = typeof (window as any).ShadowRoot !== "undefined";
const ShadowRootPrototype = usesNativeShadowRoot ? (window as any).ShadowRoot.prototype : undefined;
const attachShadowOriginal = usesNativeShadowRoot ? Element.prototype.attachShadow : undefined;

export function attachShadow(elm, options, fallback): ShadowRoot {
    let sr: ShadowRoot;
    if (isFalse(fallback)) {
        if (process.env.NODE_ENV !== 'production') {
            if (isFalse(usesNativeShadowRoot)) {
                throw new Error(`ShadowDOM is not supported.`);
            }
        }
        sr = (attachShadowOriginal as any).call(elm, options);
    } else {
        sr = create(ArtificialShadowRootPrototype) as ShadowRoot;

    }
    if (process.env.NODE_ENV !== 'production') {
        // blacklisting properties in dev mode only to avoid people doing the wrong
        // thing when using the real shadow root, because if that's the case,
        // the component will not work when running in fallback mode.
        defineProperties(sr, DevModeBlackListDescriptorMap);
    }
    return sr as ShadowRoot;
}

export function linkShadow(shadowRoot: ShadowRoot, vm: VM) {
    shadowRoot[ViewModelReflection] = vm;
}


const eventListeners: WeakMap<EventListener, EventListener> = new WeakMap();

function getWrappedListener(listener: EventListener): EventListener {
    if (!isFunction(listener)) {
        return listener; // ignoring non-callable arguments
    }
    let wrappedListener = eventListeners.get(listener);
    if (isUndefined(wrappedListener)) {
        wrappedListener = function(event: Event) {
            const vm = (event.currentTarget as HTMLElement)[ViewModelReflection];
            if (process.env.NODE_ENV !== 'production') {
                assert.vm(vm);
            }
            // * if the event is dispatched directly on the host, it is not observable from root
            // * if the event is dispatched in an element that does not belongs to the shadow and it is not composed,
            //   it is not observable from the root
            if (event.target === event.currentTarget || (isFalse((event as any).composed) && getRootNode.call(event.target) !== event.currentTarget)) {
                return;
            }
            const e = pierce(vm, event);
            invokeRootCallback(vm, listener, [e]);
        };
        eventListeners.set(listener, wrappedListener);
    }
    return wrappedListener;
}

const ArtificialShadowRootDescriptors: PropertyDescriptorMap = {
    mode: { value: 'closed' },
    delegatesFocus: { value: false },
    querySelector: {
        value(selector: string): Element | null {
            const vm = this[ViewModelReflection];
            if (process.env.NODE_ENV !== 'production') {
                assert.vm(vm);
            }
            const { elm } = vm;
            pierce(vm, elm);
            const piercedQuerySelector = piercingHook(vm.membrane as Membrane, elm, 'querySelector', querySelector);
            return piercedQuerySelector.call(elm, selector);
        }
    },
    querySelectorAll: {
        value(selector: string): NodeListOf<Element> {
            const vm = this[ViewModelReflection];
            if (process.env.NODE_ENV !== 'production') {
                assert.vm(vm);
            }
            const { elm } = vm;
            pierce(vm, elm);
            const piercedQuerySelectorAll = piercingHook(vm.membrane as Membrane, elm, 'querySelectorAll', querySelectorAll);
            return piercedQuerySelectorAll.call(elm, selector);
        }
    },
    addEventListener: {
        value(type: string, listener: EventListener, options: any) {
            const vm = this[ViewModelReflection];
            if (process.env.NODE_ENV !== 'production') {
                assert.vm(vm);
                assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${vm} by adding an event listener for "${type}".`);
                assert.invariant(isFunction(listener), `Invalid second argument for this.root.addEventListener() in ${vm} for event "${type}". Expected an EventListener but received ${listener}.`);
                let { cmpEvents } = vm;
                if (isUndefined(cmpEvents)) {
                    vm.cmpEvents = cmpEvents = create(null) as Record<string, EventListener[]>;
                }
                if (isUndefined(cmpEvents[type])) {
                    cmpEvents[type] = [];
                }
                if (ArrayIndexOf.call(cmpEvents[type], listener) !== -1) {
                    assert.logWarning(`${vm} has duplicate listeners for event "${type}". Instead add the event listener in the connectedCallback() hook.`);
                }
                ArrayPush.call(cmpEvents[type], listener);
            }
            addEventListener.call(vm.elm, type, getWrappedListener(listener), options);
        }
    },
    removeEventListener: {
        value(type: string, listener: EventListener, options: any) {
            const vm = this[ViewModelReflection];
            if (process.env.NODE_ENV !== 'production') {
                assert.vm(vm);
                assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${vm} by removing an event listener for "${type}".`);
                assert.invariant(isFunction(listener), `Invalid second argument for this.root.removeEventListener() in ${vm} for event "${type}". Expected an EventListener but received ${listener}.`);
                let { cmpEvents } = vm;
                if (isUndefined(cmpEvents)) {
                    vm.cmpEvents = cmpEvents = create(null) as Record<string, EventListener[]>;
                }
                if (isUndefined(cmpEvents[type])) {
                    cmpEvents[type] = [];
                }
                if (isUndefined(cmpEvents) || isUndefined(cmpEvents[type]) || ArrayIndexOf.call(cmpEvents[type], listener) === -1) {
                    assert.logError(`Did not find event listener ${listener} for event "${type}" on ${vm}. This is probably a typo or a life cycle mismatch. Make sure that you add the right event listeners in the connectedCallback() hook and remove them in the disconnectedCallback() hook.`);
                }
                ArraySplice.call(cmpEvents[type], ArrayIndexOf.call(cmpEvents[type], listener), 1);
            }
            removeEventListener.call(vm.elm, type, getWrappedListener(listener), options);
        }
    },
    toString: {
        value() {
            return `[object ShadowRoot]`;
        }
    },
};

function errorFn() {
    if (process.env.NODE_ENV !== 'production') {
        throw new Error(`Disallowed feature in ShadowRoot.`);
    }
}

function createAccessibilityDescriptorForShadowRoot(propName: string, attrName: string, defaultValue: any): PropertyDescriptor {
    // we use value as the storage mechanism and as the default value for the property
    return {
        enumerable: false,
        get(this: ShadowRoot): any {
            const vm = this[ViewModelReflection];
            if (!hasOwnProperty.call(vm.rootProps, propName)) {
                return defaultValue;
            }
            return vm.rootProps[propName];
        },
        set(this: ShadowRoot, newValue: any) {
            const vm = this[ViewModelReflection];
            vm.rootProps[propName] = newValue;
            if (!isUndefined(vm.hostAttrs[attrName])) {
                return;
            }
            if (isNull(newValue)) {
                removeAttribute.call(vm.elm, attrName);
                return;
            }
            setAttribute.call(vm.elm, attrName, newValue);
        }
    };
}

// This routine will add all AOM DOM properties to ShadowRoot.prototype to polyfill AOM capabilities when needed
forEach.call(getOwnPropertyNames(GlobalAOMProperties), (propName: string) => {
    const descriptor = createAccessibilityDescriptorForShadowRoot(propName, getAttrNameFromPropName(propName), GlobalAOMProperties[propName]);
    if (!isUndefined(ShadowRootPrototype) && !hasOwnProperty.call(ShadowRootPrototype, propName)) {
        // conditionally polyfilling the original ShadowRoot.prototype
        defineProperty(ShadowRootPrototype, propName, descriptor);
    }
    // always adding it to ArtificialShadowRootDescriptors
    ArtificialShadowRootDescriptors[propName] = descriptor;
});

const ArtificialShadowRootPrototype = create({}, ArtificialShadowRootDescriptors);
let DevModeBlackListDescriptorMap: PropertyDescriptorMap;

if (process.env.NODE_ENV !== 'production') {
    DevModeBlackListDescriptorMap = {};
    const BlackListedShadowRootMethods = {
        appendChild: 0,
        cloneNode: 0,
        compareDocumentPosition: 0,
        contains: 0,
        insertBefore: 0,
        hasChildNodes: 0,
        getElementById: 0,
        getSelection: 0,
        elementFromPoint: 0,
        elementsFromPoint: 0,
    };
    // This routine will prevent access to certain methods on a shadow root instance to guarantee
    // that all components will work fine in IE11 and other browsers without shadow dom support
    forEach.call(getOwnPropertyNames(BlackListedShadowRootMethods), (methodName: string) => {
        const descriptor = {
            get: errorFn,
        };
        DevModeBlackListDescriptorMap[methodName] = descriptor;
    });

    const BlackListedShadowRootProperties = {
        childNodes: 0,
        firstChild: 0,
        lastChild: 0,
        ownerDocument: 0,
        innerHTML: 0,
        outerHTML: 0,
        textContent: 0,
        host: 0,
    };
    // This routine will prevent access to certain properties on a shadow root instance to guarantee
    // that all components will work fine in IE11 and other browsers without shadow dom support
    forEach.call(getOwnPropertyNames(BlackListedShadowRootProperties), (propName: string) => {
        const descriptor = {
            get: errorFn
        };
        DevModeBlackListDescriptorMap[propName] = descriptor;
    });
}

// From this point on, it is all about the shadow root polyfill membrane implementation

function getFirstMatch(vm: VM, elm: Element, selector: string): Node | null {
    const nodeList = querySelectorAll.call(elm, selector);
    // search for all, and find the first node that is owned by the VM in question.
    for (let i = 0, len = nodeList.length; i < len; i += 1) {
        if (isNodeOwnedByVM(vm, nodeList[i])) {
            return pierce(vm, nodeList[i]);
        }
    }
    return null;
}

function getAllMatches(vm: VM, elm: Element, selector: string): NodeList {
    const nodeList = querySelectorAll.call(elm, selector);
    const filteredNodes = ArrayFilter.call(nodeList, (node: Node): boolean => isNodeOwnedByVM(vm, node));
    return pierce(vm , filteredNodes);
}

function isParentNodeKeyword(key: PropertyKey): boolean {
    return (key === 'parentNode' || key === 'parentElement');
}

function isIframeContentWindow(key: PropertyKey, value: any) {
    return (key === 'contentWindow') && value.window === value;
}

// TODO: this is being exported only for testing purposes, we should change that
export function wrapIframeWindow(win: Window) {
    return {
        [TargetSlot]: win,
        postMessage() {
            return win.postMessage.apply(win, arguments);
        },
        blur() {
            return win.blur.apply(win, arguments);
        },
        close() {
            return win.close.apply(win, arguments);
        },
        focus() {
            return win.focus.apply(win, arguments);
        },
        get closed() {
            return win.closed;
        },
        get frames() {
            return win.frames;
        },
        get length() {
            return win.length;
        },
        get location() {
            return win.location;
        },
        set location(value) {
            (win.location as any) = value;
        },
        get opener() {
            return win.opener;
        },
        get parent() {
            return win.parent;
        },
        get self() {
            return win.self;
        },
        get top() {
            return win.top;
        },
        get window() {
            return win.window;
        },
    };
}

export function isChildNode(root: Element, node: Node): boolean {
    return !!(compareDocumentPosition.call(root, node) & DOCUMENT_POSITION_CONTAINED_BY);
}

// Registering a service to enforce the shadowDOM semantics via the Raptor membrane implementation
register({
    piercing(component: Component, data: VNodeData, def: ComponentDef, context: Context, target: Replicable, key: PropertyKey, value: any, callback: (value?: any) => void) {
        const vm: VM = component[ViewModelReflection];
        const { elm } = vm;
        if (value) {
            if (isIframeContentWindow(key as PropertyKey, value)) {
                callback(wrapIframeWindow(value));
            }
            if (value === querySelector) {
                // TODO: it is possible that they invoke the querySelector() function via call or apply to set a new context, what should
                // we do in that case? Right now this is essentially a bound function, but the original is not.
                return callback((selector: string): Node | null => getFirstMatch(vm, target as Element, selector));
            }
            if (value === querySelectorAll) {
                // TODO: it is possible that they invoke the querySelectorAll() function via call or apply to set a new context, what should
                // we do in that case? Right now this is essentially a bound function, but the original is not.
                return callback((selector: string): NodeList => getAllMatches(vm, target as Element, selector));
            }
            if (isParentNodeKeyword(key)) {
                if (value === elm) {
                    // walking up via parent chain might end up in the shadow root element
                    return callback(component.root);
                } else if (target[OwnerKey] !== value[OwnerKey]) {
                    // cutting out access to something outside of the shadow of the current target (usually slots)
                    return callback();
                }
            }
            if (target instanceof Event) {
                switch (key) {
                    case 'currentTarget':
                        // intentionally return the host element pierced here otherwise the general role below
                        // will kick in and return the cmp, which is not the intent.
                        return callback(pierce(vm, value));
                    case 'target':
                        const { currentTarget } = (target as Event);
                        if (currentTarget === elm || isChildNode(elm, currentTarget as Node)) {
                            let root = value; // initial root is always the original target
                            while (root !== elm) {
                                value = root;
                                root = getRootNode.call(value);
                            }
                            return callback(pierce(vm, value));
                        }
                }
            }
            if (value === elm) {
                // prevent access to the original Host element
                return callback(component);
            }
        }
    }
});

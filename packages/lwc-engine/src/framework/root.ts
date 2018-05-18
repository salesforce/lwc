import assert from "./assert";
import { ViewModelReflection } from "./def";
import { isUndefined, defineProperty, isNull, defineProperties, create, getOwnPropertyNames, forEach, hasOwnProperty } from "./language";
import { getCustomElementComponent } from "./component";
import { OwnerKey, VM, getElementOwnerVM, getCustomElementVM } from "./vm";
import { register } from "./services";
import { Component } from "./component";
import { Replicable } from "./membrane";
import { addRootEventListener, removeRootEventListener } from "./events";
import { shadowRootQuerySelector, shadowRootQuerySelectorAll } from "./traverse";

import { TargetSlot } from './membrane';
import {
    GlobalAOMProperties,
    setAttribute,
    removeAttribute,
} from './dom';
import { getAttrNameFromPropName } from "./utils";

export interface ShadowRoot {
    [ViewModelReflection]: VM;
    readonly mode: string;
    readonly innerHTML: string;
    readonly host: Component;
    querySelector(selector: string): HTMLElement | null;
    querySelectorAll(selector: string): HTMLElement[];
    addEventListener(type: string, listener: EventListener, options?: any): void;
    removeEventListener(type: string, listener: EventListener, options?: any): void;
    toString(): string;
}

function createAccessibilityDescriptorForShadowRoot(propName: string, attrName: string, defaultValue: any): PropertyDescriptor {
    // we use value as the storage mechanism and as the default value for the property
    return {
        enumerable: false,
        get(this: ShadowRoot): any {
            const vm = getCustomElementVM(this);
            if (!hasOwnProperty.call(vm.rootProps, propName)) {
                return defaultValue;
            }
            return vm.rootProps[propName];
        },
        set(this: ShadowRoot, newValue: any) {
            const vm = getCustomElementVM(this);
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

const RootDescriptors: PropertyDescriptorMap = create(null);

// This routine will build a descriptor map for all AOM properties to be added
// to ShadowRoot prototype to polyfill AOM capabilities.
forEach.call(getOwnPropertyNames(GlobalAOMProperties), (propName: string) => RootDescriptors[propName] = createAccessibilityDescriptorForShadowRoot(propName, getAttrNameFromPropName(propName), GlobalAOMProperties[propName]));

export class Root implements ShadowRoot {
    [ViewModelReflection]: VM;
    constructor(vm: VM) {
        if (process.env.NODE_ENV !== 'production') {
            assert.vm(vm);
        }
        defineProperty(this, ViewModelReflection, {
            value: vm,
        });
    }
    get mode(): string {
        return 'closed';
    }
    get host(): Component {
        return getCustomElementVM(this).component as Component;
    }
    get innerHTML(): string {
        // TODO: should we add this only in dev mode? or wrap this in dev mode?
        throw new Error();
    }
    querySelector(selector: string): HTMLElement | null {
        const node = shadowRootQuerySelector(this[ViewModelReflection], selector);
        if (process.env.NODE_ENV !== 'production') {
            // TODO: this invocation into component is invalid, and should be eventually removed
            const component = getCustomElementComponent(this as ShadowRoot);
            if (isNull(node) && component.querySelector(selector)) {
                assert.logWarning(`this.template.querySelector() can only return elements from the template declaration of ${component}. It seems that you are looking for elements that were passed via slots, in which case you should use this.querySelector() instead.`);
            }
        }
        return node as HTMLElement;
    }
    querySelectorAll(selector: string): HTMLElement[] {
        const nodeList = shadowRootQuerySelectorAll(this[ViewModelReflection], selector);
        if (process.env.NODE_ENV !== 'production') {
            // TODO: this invocation into component is invalid, and should be eventually removed
            const component = getCustomElementComponent(this);
            if (nodeList.length === 0 && component.querySelectorAll(selector).length) {
                assert.logWarning(`this.template.querySelectorAll() can only return elements from template declaration of ${component}. It seems that you are looking for elements that were passed via slots, in which case you should use this.querySelectorAll() instead.`);
            }
        }
        return nodeList;
    }

    addEventListener(type: string, listener: EventListener, options?: any) {
        const vm = getCustomElementVM(this);
        addRootEventListener(vm, type, listener, options);
    }

    removeEventListener(type: string, listener: EventListener, options?: any) {
        const vm = getCustomElementVM(this);
        removeRootEventListener(vm, type, listener, options);
    }
    toString(): string {
        const component = getCustomElementComponent(this);
        return `Current ShadowRoot for ${component}`;
    }
}
defineProperties(Root.prototype, RootDescriptors);

function isParentNodeKeyword(key: PropertyKey): boolean {
    return (key === 'parentNode' || key === 'parentElement');
}

function isIframeContentWindow(key: PropertyKey, value: any) {
    return (key === 'contentWindow') && value.window === value;
}

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

const GET_ROOT_NODE_CONFIG_FALSE = { composed: false };

// Registering a service to enforce the shadowDOM semantics via the Raptor membrane implementation
register({
    piercing(target: Replicable, key: PropertyKey, value: any, callback: (value?: any) => void) {
        if (value) {
            if (isIframeContentWindow(key as PropertyKey, value)) {
                callback(wrapIframeWindow(value));
            }
            if (isParentNodeKeyword(key)) {
                const vm = getElementOwnerVM(target as Element);
                if (!isUndefined(vm) && value === vm.elm) {
                    // walking up via parent chain might end up in the shadow root element
                    return callback((vm.component as Component).template);
                } else if (target instanceof Element && value instanceof Element && target[OwnerKey] !== value[OwnerKey]) {
                    // cutting out access to something outside of the shadow of the current target (usually slots)
                    return callback(); // TODO: this should probably be `null`
                }
            }
        }
    }
});

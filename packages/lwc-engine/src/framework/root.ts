import assert from "./assert";
import { ViewModelReflection } from "./def";
import { isUndefined, defineProperty, isNull, defineProperties, create, getOwnPropertyNames, forEach, hasOwnProperty } from "./language";
import { getCustomElementComponent } from "./component";
import { getShadowRootVM, VM } from "./vm";
import { Component } from "./component";
import { addRootEventListener, removeRootEventListener } from "./events";
import { shadowRootQuerySelector, shadowRootQuerySelectorAll, lightDomQuerySelectorAll, lightDomQuerySelector } from "./traverse";
import { TargetSlot } from "./membrane";
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
            const vm = getShadowRootVM(this);
            if (!hasOwnProperty.call(vm.rootProps, propName)) {
                return defaultValue;
            }
            return vm.rootProps[propName];
        },
        set(this: ShadowRoot, newValue: any) {
            const vm = getShadowRootVM(this);
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
        // TODO: this should be disable at some point
        return getShadowRootVM(this).component as Component;
    }
    get innerHTML(): string {
        // TODO: should we add this only in dev mode? or wrap this in dev mode?
        throw new Error();
    }
    querySelector(selector: string): HTMLElement | null {
        const vm = getShadowRootVM(this);
        const node = shadowRootQuerySelector(vm, selector);
        if (process.env.NODE_ENV !== 'production') {
            if (isNull(node)) {
                if (vm.elm.querySelector(selector)) {
                    assert.logWarning(`this.template.querySelector() can only return elements from the template declaration of ${vm}. It seems that you are looking for elements that were passed via slots, in which case you should use this.querySelector() instead.`);
                }
            }
        }
        return node as HTMLElement;
    }
    querySelectorAll(selector: string): HTMLElement[] {
        const vm = getShadowRootVM(this);
        const nodeList = shadowRootQuerySelectorAll(vm, selector);
        if (process.env.NODE_ENV !== 'production') {
            if (nodeList.length === 0) {
                const results = vm.elm.querySelectorAll(selector);
                if (results.length) {
                    assert.logWarning(`this.template.querySelectorAll() can only return elements from template declaration of ${vm}. It seems that you are looking for elements that were passed via slots, in which case you should use this.querySelectorAll() instead.`);
                }
            }
        }
        return nodeList;
    }

    addEventListener(type: string, listener: EventListener, options?: any) {
        const vm = getShadowRootVM(this);
        addRootEventListener(vm, type, listener, options);
    }

    removeEventListener(type: string, listener: EventListener, options?: any) {
        const vm = getShadowRootVM(this);
        removeRootEventListener(vm, type, listener, options);
    }
    toString(): string {
        const component = getCustomElementComponent(this);
        return `Current ShadowRoot for ${component}`;
    }
}
defineProperties(Root.prototype, RootDescriptors);

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

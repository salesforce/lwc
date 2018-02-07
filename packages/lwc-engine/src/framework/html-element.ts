import assert from "./assert";
import { Root, shadowRootQuerySelector, shadowRootQuerySelectorAll, ShadowRoot } from "./root";
import { vmBeingConstructed, isBeingConstructed, addComponentEventListener, removeComponentEventListener, Component } from "./component";
import { ArrayFilter, freeze, seal, defineProperty, getOwnPropertyNames, isUndefined, ArraySlice, isNull, keys, defineProperties, toString } from "./language";
import { GlobalHTMLProperties } from "./dom";
import { getPropNameFromAttrName } from "./utils";
import { isRendering, vmBeingRendered } from "./invoker";
import { wasNodePassedIntoVM, VM } from "./vm";
import { pierce, piercingHook } from "./piercing";
import { ViewModelReflection } from "./def";
import { Membrane } from "./membrane";
import { isString } from "./language";

const {
    getAttribute,
} = Element.prototype;

function getLinkedElement(cmp: Component): HTMLElement {
    return cmp[ViewModelReflection].elm;
}

function querySelectorAllFromComponent(cmp: Component, selectors: string): NodeList {
    const elm = getLinkedElement(cmp);
    return elm.querySelectorAll(selectors);
}

export interface ComposableEvent extends Event {
    composed: boolean;
}

// This should be as performant as possible, while any initialization should be done lazily
class LWCElement implements Component {
    [ViewModelReflection]: VM;
    constructor() {
        if (isNull(vmBeingConstructed)) {
            throw new ReferenceError();
        }
        if (process.env.NODE_ENV !== 'production') {
            assert.vm(vmBeingConstructed);
            assert.invariant(vmBeingConstructed.elm instanceof HTMLElement, `Component creation requires a DOM element to be associated to ${vmBeingConstructed}.`);
            const { def: { observedAttrs, attributeChangedCallback } } = vmBeingConstructed;
            if (observedAttrs.length && isUndefined(attributeChangedCallback)) {
                assert.logError(`${vmBeingConstructed} has static observedAttributes set to ["${keys(observedAttrs).join('", "')}"] but it is missing the attributeChangedCallback() method to watch for changes on those attributes. Double check for typos on the name of the callback.`);
            }
        }
        const vm = vmBeingConstructed;
        const { elm, def } = vm;
        const component = this as Component;
        vm.component = component;
        // TODO: eventually the render method should be a static property on the ctor instead
        // catching render method to match other callbacks
        vm.render = component.render;
        // linking elm and its component with VM
        component[ViewModelReflection] = elm[ViewModelReflection] = vm;
        defineProperties(elm, def.descriptors);
    }
    // HTML Element - The Good Parts
    dispatchEvent(event: ComposableEvent): boolean {
        const elm = getLinkedElement(this);
        const vm = getCustomElementVM(this);

        if (process.env.NODE_ENV !== 'production') {
            const { type: evtName, composed, bubbles } = event;
            assert.isFalse(isBeingConstructed(vm), `this.dispatchEvent() should not be called during the construction of the custom element for ${this} because no one is listening for the event "${evtName}" just yet.`);
            if (bubbles && ('composed' in event && !composed)) {
                assert.logWarning(`Invalid event "${evtName}" dispatched in element ${this}. Events with 'bubbles: true' must also be 'composed: true'. Without 'composed: true', the dispatched event will not be observable outside of your component.`);
            }
            if (vm.idx === 0) {
                assert.logWarning(`Unreachable event "${evtName}" dispatched from disconnected element ${this}. Events can only reach the parent element after the element is connected (via connectedCallback) and before the element is disconnected(via disconnectedCallback).`);
            }

            if (!evtName.match(/^[a-z]+([a-z0-9]+)?$/)) {
                assert.logWarning(`Invalid event type: '${evtName}' dispatched in element ${this}. Event name should only contain lowercase alphanumeric characters.`);
            }
        }

        // Pierce dispatchEvent so locker service has a chance to overwrite
        pierce(vm, elm);
        const dispatchEvent = piercingHook(vm.membrane as Membrane, elm, 'dispatchEvent', elm.dispatchEvent);
        return dispatchEvent.call(elm, event);
    }
    addEventListener(type: string, listener: EventListener) {
        const vm = getCustomElementVM(this);
        if (process.env.NODE_ENV !== 'production') {
            assert.vm(vm);

            if (arguments.length > 2) {
                // TODO: can we synthetically implement `passive` and `once`? Capture is probably ok not supporting it.
                assert.logWarning(`this.addEventListener() on ${vm} does not support more than 2 arguments. Options to make the listener passive, once or capture are not allowed at the top level of the component's fragment.`);
            }
        }
        addComponentEventListener(vm, type, listener);
    }
    removeEventListener(type: string, listener: EventListener) {
        const vm = getCustomElementVM(this);

        if (process.env.NODE_ENV !== 'production') {
            assert.vm(vm);

            if (arguments.length > 2) {
                assert.logWarning(`this.removeEventListener() on ${vm} does not support more than 2 arguments. Options to make the listener passive or capture are not allowed at the top level of the component's fragment.`);
            }
        }
        removeComponentEventListener(vm, type, listener);
    }
    getAttribute(attrName: string | null | undefined): string | null {
        const vm = getCustomElementVM(this);

        // logging errors for experimentals and special attributes
        if (process.env.NODE_ENV !== 'production') {
            assert.vm(vm);
            if (isString(attrName)) {
                const propName = getPropNameFromAttrName(attrName);
                const { def: { props: publicPropsConfig } } = vm;
                if (propName && publicPropsConfig[propName]) {
                    throw new ReferenceError(`Attribute "${attrName}" corresponds to public property ${propName} from ${vm}. Instead use \`this.${propName}\`. Only use \`getAttribute()\` to access global HTML attributes.`);
                } else if (GlobalHTMLProperties[propName] && GlobalHTMLProperties[propName].attribute) {
                    const { error, experimental } = GlobalHTMLProperties[propName];
                    if (error) {
                        assert.logError(error);
                    } else if (experimental) {
                        assert.logError(`Attribute \`${attrName}\` is an experimental attribute that is not standardized or supported by all browsers. Property "${propName}" and attribute "${attrName}" are ignored.`);
                    }
                }
            }
        }

        const elm = getLinkedElement(this);
        return elm.getAttribute.apply(elm, ArraySlice.call(arguments));
    }
    getBoundingClientRect(): ClientRect {
        const elm = getLinkedElement(this);
        if (process.env.NODE_ENV !== 'production') {
            const vm = getCustomElementVM(this);
            assert.isFalse(isBeingConstructed(vm), `this.getBoundingClientRect() should not be called during the construction of the custom element for ${this} because the element is not yet in the DOM, instead, you can use it in one of the available life-cycle hooks.`);
        }
        return elm.getBoundingClientRect();
    }
    querySelector(selectors: string): Node | null {
        const vm = getCustomElementVM(this);
        if (process.env.NODE_ENV !== 'production') {
            assert.isFalse(isBeingConstructed(vm), `this.querySelector() cannot be called during the construction of the custom element for ${this} because no children has been added to this element yet.`);
        }
        const nodeList = querySelectorAllFromComponent(this, selectors);
        for (let i = 0, len = nodeList.length; i < len; i += 1) {
            if (wasNodePassedIntoVM(vm, nodeList[i])) {
                // TODO: locker service might need to return a membrane proxy
                return pierce(vm, nodeList[i]);
            }
        }

        if (process.env.NODE_ENV !== 'production') {
            if (shadowRootQuerySelector(this.root, selectors)) {
                assert.logWarning(`this.querySelector() can only return elements that were passed into ${vm.component} via slots. It seems that you are looking for elements from your template declaration, in which case you should use this.root.querySelector() instead.`);
            }
        }

        return null;
    }
    querySelectorAll(selectors: string): NodeList {
        const vm = getCustomElementVM(this);
        if (process.env.NODE_ENV !== 'production') {
            assert.isFalse(isBeingConstructed(vm), `this.querySelectorAll() cannot be called during the construction of the custom element for ${this} because no children has been added to this element yet.`);
        }

        const nodeList = querySelectorAllFromComponent(this, selectors);
        // TODO: locker service might need to do something here
        const filteredNodes = ArrayFilter.call(nodeList, (node: Node): boolean => wasNodePassedIntoVM(vm, node));

        if (process.env.NODE_ENV !== 'production') {
            if (filteredNodes.length === 0 && shadowRootQuerySelectorAll(this.root, selectors).length) {
                assert.logWarning(`this.querySelectorAll() can only return elements that were passed into ${vm.component} via slots. It seems that you are looking for elements from your template declaration, in which case you should use this.root.querySelectorAll() instead.`);
            }
        }
        return pierce(vm, filteredNodes);
    }
    get tagName(): string {
        const elm = getLinkedElement(this);
        return elm.tagName + ''; // avoiding side-channeling
    }
    get tabIndex(): number {
        const elm = getLinkedElement(this);
        return elm.tabIndex;
    }
    set tabIndex(value: number) {
        const vm = getCustomElementVM(this);
        if (process.env.NODE_ENV !== 'production') {
            assert.isFalse(isRendering, `Setting property "tabIndex" of ${toString(value)} during the rendering process of ${vmBeingRendered} is invalid. The render phase must have no side effects on the state of any component.`);
            if (isBeingConstructed(vm)) {
                assert.fail(`Setting property "tabIndex" during the construction process of ${vm} is invalid.`);
            }
        }

        if (isBeingConstructed(vm)) {
            return;
        }
        const elm = getLinkedElement(this);
        elm.tabIndex = value;
    }
    get classList(): DOMTokenList {
        if (process.env.NODE_ENV !== 'production') {
            const vm = getCustomElementVM(this);
            // TODO: this still fails in dev but works in production, eventually, we should just throw in all modes
            assert.isFalse(isBeingConstructed(vm), `Failed to construct ${vm}: The result must not have attributes. Adding or tampering with classname in constructor is not allowed in a web component, use connectedCallback() instead.`);
        }
        return getLinkedElement(this).classList;
    }
    get root(): ShadowRoot {
        const vm = getCustomElementVM(this);
        if (process.env.NODE_ENV !== 'production') {
            assert.vm(vm);
        }
        let { cmpRoot } = vm;
        // lazy creation of the ShadowRoot Object the first time it is accessed.
        if (isUndefined(cmpRoot)) {
            cmpRoot = new Root(vm);
            vm.cmpRoot = cmpRoot;
        }
        return cmpRoot;
    }
    toString(): string {
        const vm = getCustomElementVM(this);
        if (process.env.NODE_ENV !== 'production') {
            assert.vm(vm);
        }
        const { elm } = vm;
        const { tagName } = elm;
        const is = getAttribute.call(elm, 'is');
        return `<${tagName.toLowerCase()}${ is ? ' is="${is}' : '' }>`;
    }
}

// Global HTML Attributes
if (process.env.NODE_ENV !== 'production') {
    getOwnPropertyNames(GlobalHTMLProperties).forEach((propName: string) => {
        if (propName in LWCElement.prototype) {
            return; // no need to redefine something that we are already exposing
        }
        defineProperty(LWCElement.prototype, propName, {
            get() {
                const vm = getCustomElementVM(this as HTMLElement);
                const { error, attribute, readOnly, experimental } = GlobalHTMLProperties[propName];
                const msg = [];
                msg.push(`Accessing the global HTML property "${propName}" in ${vm} is disabled.`);
                if (error) {
                    msg.push(error);
                } else {
                    if (experimental) {
                        msg.push(`This is an experimental property that is not standardized or supported by all browsers. Property "${propName}" and attribute "${attribute}" are ignored.`);
                    }
                    if (readOnly) {
                        // TODO - need to improve this message
                        msg.push(`Property is read-only.`);
                    }
                    if (attribute) {
                        msg.push(`"Instead access it via the reflective attribute "${attribute}" with one of these techniques:`);
                        msg.push(`  * Use \`this.getAttribute("${attribute}")\` to access the attribute value. This option is best suited for accessing the value in a getter during the rendering process.`);
                        msg.push(`  * Declare \`static observedAttributes = ["${attribute}"]\` and use \`attributeChangedCallback(attrName, oldValue, newValue)\` to get a notification each time the attribute changes. This option is best suited for reactive programming, eg. fetching new data each time the attribute is updated.`);
                    }
                }
                console.log(msg.join('\n')); // tslint:disable-line
                return; // explicit undefined
            },
            enumerable: false,
        });
    });

}

freeze(LWCElement);
seal(LWCElement.prototype);

export { LWCElement as Element };

export function getCustomElementVM(elmOrCmp: HTMLElement | Component | ShadowRoot): VM {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(elmOrCmp[ViewModelReflection]);
    }
    return elmOrCmp[ViewModelReflection] as VM;
}

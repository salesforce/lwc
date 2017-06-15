import assert from "./assert";
import { ClassList } from "./class-list";
import { Root, shadowRootQuerySelector, shadowRootQuerySelectorAll } from "./root";
import { vmBeingConstructed, isBeingConstructed, addComponentEventListener, removeComponentEventListener } from "./component";
import { ArrayFilter, isArray, freeze, seal, defineProperty, getOwnPropertyNames, isUndefined, isObject, create } from "./language";
import { getPropertyProxy } from "./properties";
import { GlobalHTMLProperties } from "./dom";
import { getPropNameFromAttrName, noop, toAttributeValue } from "./utils";
import { isRendering, vmBeingRendered } from "./invoker";
import { subscribeToSetHook } from "./watcher";
import { wasNodePassedIntoVM, getMembrane } from "./vm";

export const ViewModelReflection = Symbol('internal');

function getLinkedElement(cmp: ComponentElement): HTMLElement {
    return cmp[ViewModelReflection].vnode.elm;
}

function querySelectorAllFromComponent(cmp: ComponentElement, selectors: string): NodeList {
    const elm = getLinkedElement(cmp);
    return elm.querySelectorAll(selectors);
}

export function createPublicPropertyDescriptorMap(propName: string): PropertyDescriptorMap {
    const descriptors = {};
    function getter(): any {
        const vm = this[ViewModelReflection];
        assert.vm(vm);
        if (isBeingConstructed(vm)) {
            assert.logError(`${vm} constructor should not read the value of property "${propName}". The owner component has not yet set the value. Instead use the constructor to set default values for properties.`);
            return;
        }
        const { cmpProps } = vm;
        if (isRendering) {
            // this is needed because the proxy used by template is not sufficient
            // for public props accessed from within a getter in the component.
            subscribeToSetHook(vmBeingRendered, cmpProps, propName);
        }
        return cmpProps[propName];
    }
    function setter(value: any) {
        const vm = this[ViewModelReflection];
        assert.vm(vm);
        if (!isBeingConstructed(vm)) {
            assert.logError(`${vm} can only set a new value for property "${propName}" during construction.`);
            return;
        }
        const { cmpProps } = vm;
        // proxifying before storing it is a must for public props
        cmpProps[propName] = isObject(value) ? getPropertyProxy(value) : value;
    }
    descriptors[propName] = {
        get: getter,
        set: setter,
        enumerable: true,
        configurable: true,
    };
    return descriptors;
}

// This should be as performant as possible, while any initialization should be done lazily
function ComponentElement(): ComponentElement {
    assert.vm(vmBeingConstructed, `Invalid construction.`);
    assert.vnode(vmBeingConstructed.vnode, `Invalid construction.`);
    const vnode = vmBeingConstructed.vnode;
    assert.invariant(vnode.elm instanceof HTMLElement, `Component creation requires a DOM element to be associated to ${vnode}.`);
    vmBeingConstructed.component = this;
    this[ViewModelReflection] = vmBeingConstructed;
}

ComponentElement.prototype = {
    // Raptor.Element APIs
    renderedCallback: noop,
    render: noop,

    // Web Component - The Good Parts
    connectedCallback: noop,
    disconnectedCallback: noop,

    // HTML Element - The Good Parts
    dispatchEvent(event: Event): boolean {
        const elm = getLinkedElement(this);
        assert.isFalse(isBeingConstructed(this[ViewModelReflection]), `this.dispatchEvent() should not be called during the construction of the custom element for ${this} because no one is listening for the event ${event} just yet.`);
        // custom elements will rely on the DOM dispatchEvent mechanism
        return elm.dispatchEvent(event);
    },
    addEventListener(type: string, listener: EventListener) {
        const vm = this[ViewModelReflection];
        assert.vm(vm);
        assert.block(function devModeCheck() {
            if (arguments.length > 2) {
                // TODO: can we synthetically implement `passive` and `once`? Capture is probably ok not supporting it.
                assert.logWarning(`this.addEventListener() on ${vm} does not support more than 2 arguments. Options to make the listener passive, once or capture are not allowed at the top level of the component's fragment.`);
            }
        });
        addComponentEventListener(vm, type, listener);
    },
    removeEventListener(type: string, listener: EventListener) {
        const vm = this[ViewModelReflection];
        assert.vm(vm);
        assert.block(function devModeCheck() {
            if (arguments.length > 2) {
                assert.logWarning(`this.removeEventListener() on ${vm} does not support more than 2 arguments. Options to make the listener passive or capture are not allowed at the top level of the component's fragment.`);
            }
        });
        removeComponentEventListener(vm, type, listener);
    },
    getAttribute(attrName: string): string | null {
        const vm = this[ViewModelReflection];
        assert.vm(vm);
        const { vnode: { data: { attrs } } } = vm;
        if (!attrName) {
            if (arguments.length === 0) {
                throw new TypeError(`Failed to execute \`getAttribute\` on ${vm}: 1 argument is required, got 0.`);
            }
            return null;
        }
        // logging errors for experimentals and special attributes
        assert.block(function devModeCheck() {
            const propName = getPropNameFromAttrName(attrName);
            const { def: { props: publicPropsConfig } } = vm;
            if (publicPropsConfig[propName]) {
                throw new ReferenceError(`Attribute "${attrName}" corresponds to public property ${propName} from ${vm}. Instead use \`this.${propName}\`. Only use \`getAttribute()\` to access global HTML attributes.`);
            } else if (GlobalHTMLProperties[propName] && GlobalHTMLProperties[propName].attribute) {
                const { error, experimental } = GlobalHTMLProperties[propName];
                if (error) {
                    console.error(error);
                } else if (experimental) {
                    console.error(`Attribute \`${attrName}\` is an experimental attribute that is not standardized or supported by all browsers. Property "${propName}" and attribute "${attrName}" are ignored.`);
                }
            }
        });
        // normalizing attrs from compiler into HTML global attributes
        let raw = attrs && attrName in attrs ? attrs[attrName] : null;
        return toAttributeValue(raw);
    },
    getBoundingClientRect(): DOMRect {
        const elm = getLinkedElement(this);
        assert.isFalse(isBeingConstructed(this[ViewModelReflection]), `this.getBoundingClientRect() should not be called during the construction of the custom element for ${this} because the element is not yet in the DOM, instead, you can use it in one of the available life-cycle hooks.`);
        return elm.getBoundingClientRect();
    },
    querySelector(selectors: string): Node {
        const vm = this[ViewModelReflection];
        assert.isFalse(isBeingConstructed(vm), `this.querySelector() cannot be called during the construction of the custom element for ${this} because no children has been added to this element yet.`);
        const nodeList = querySelectorAllFromComponent(this, selectors);
        for (let i = 0, len = nodeList.length; i < len; i += 1) {
            if (wasNodePassedIntoVM(vm, nodeList[i])) {
                // TODO: locker service might need to return a membrane proxy
                return getMembrane(vm).pierce(nodeList[i]);
            }
        }
        assert.block(() => {
            if (shadowRootQuerySelector(this.root, selectors)) {
                assert.logWarning(`this.querySelector() can only return elements that were passed into ${vm.component} via slots. It seems that you are looking for elements from your template declaration, in which case you should use this.root.querySelector() instead.`);
            }
        });

        return null;
    },
    querySelectorAll(selectors: string): NodeList {
        const vm = this[ViewModelReflection];
        assert.isFalse(isBeingConstructed(vm), `this.querySelectorAll() cannot be called during the construction of the custom element for ${this} because no children has been added to this element yet.`);
        const nodeList = querySelectorAllFromComponent(this, selectors);
        // TODO: locker service might need to do something here
        const filteredNodes = ArrayFilter.call(nodeList, (node: Node): boolean => wasNodePassedIntoVM(vm, node));
        assert.block(() => {
            if (filteredNodes.length === 0 && shadowRootQuerySelectorAll(this.root, selectors).length) {
                assert.logWarning(`this.querySelectorAll() can only return elements that were passed into ${vm.component} via slots. It seems that you are looking for elements from your template declaration, in which case you should use this.root.querySelectorAll() instead.`);
            }
        });
        return  getMembrane(vm).pierce(filteredNodes);
    },
    get tagName(): string {
        const elm = getLinkedElement(this);
        return elm.tagName + ''; // avoiding side-channeling
    },
    get classList(): DOMTokenList {
        const vm = this[ViewModelReflection];
        assert.vm(vm);
        let { classListObj } = vm;
        // lazy creation of the ClassList Object the first time it is accessed.
        if (isUndefined(classListObj)) {
            vm.cmpClasses = {};
            classListObj = new ClassList(vm);
            vm.classListObj = classListObj;
        }
        return classListObj;
    },
    get root(): ShadowRoot {
        const vm = this[ViewModelReflection];
        assert.vm(vm);
        let { cmpRoot } = vm;
        // lazy creation of the ShadowRoot Object the first time it is accessed.
        if (isUndefined(cmpRoot)) {
            cmpRoot = new Root(vm);
            vm.cmpRoot = cmpRoot;
        }
        return cmpRoot;
    },
    get state(): HashTable<any> {
        const vm = this[ViewModelReflection];
        assert.vm(vm);
        let { cmpState } = vm;
        if (isUndefined(cmpState)) {
            cmpState = vm.cmpState = getPropertyProxy(create(null)); // lazy creation of the cmpState
        }
        return cmpState;
    },
    set state(newState: HashTable<any>) {
        const vm = this[ViewModelReflection];
        assert.vm(vm);
        if (!newState || !isObject(newState) || isArray(newState)) {
            assert.logError(`${vm} failed to set new state to ${newState}. \`this.state\` can only be set to an object.`);
            return;
        }
        let { cmpState } = vm;
        if (isUndefined(cmpState)) {
            cmpState = vm.cmpState = getPropertyProxy(create(null)); // lazy creation of the cmpState
        }
        if (cmpState !== newState) {
            for (let key in cmpState) {
                if (!(key in newState)) {
                    cmpState[key] = undefined; // prefer setting to undefined over deleting for perf reasons
                }
            }
            for (let key in newState) {
                cmpState[key] = newState[key];
            }
        }
    },
    toString(): string {
        const vm = this[ViewModelReflection];
        assert.vm(vm);
        const { vnode: { sel, data: { attrs } } } = vm;
        const is = attrs && attrs.is;
        return `<${sel}${ is ? ' is="${is}' : '' }>`;
    },
}

// Global HTML Attributes
assert.block(function devModeCheck() {

    getOwnPropertyNames(GlobalHTMLProperties).forEach((propName: string) => {
        if (propName in ComponentElement.prototype) {
            return; // no need to redefine something that we are already exposing
        }
        defineProperty(ComponentElement.prototype, propName, {
            get: function () {
                const vm = this[ViewModelReflection];
                assert.vm(vm);
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
                console.log(msg.join('\n'));
                return; // explicit undefined
            },
            enumerable: false,
        })
    });

});

freeze(ComponentElement);
seal(ComponentElement.prototype);

export { ComponentElement as Element };

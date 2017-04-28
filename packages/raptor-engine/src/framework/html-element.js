import assert from "./assert.js";
import { getLinkedVNode } from "./vm.js";
import { ClassList } from "./class-list.js";
import { addComponentEventListener, removeComponentEventListener } from "./component.js";
import { isArray, freeze, seal, defineProperty, getOwnPropertyNames, isUndefined, isObject, create } from "./language.js";
import { getPropertyProxy } from "./properties.js";
import { GlobalHTMLProperties } from "./dom.js";
import { getPropNameFromAttrName, noop, toAttributeValue } from "./utils.js";

function getLinkedElement(cmp: ComponentElement): HTMLElement {
    const vnode = getLinkedVNode(cmp);
    assert.vnode(vnode);
    const { elm } = vnode;
    assert.isTrue(elm instanceof HTMLElement, `Invalid association between component ${cmp} and element ${elm}.`);
    return elm;
}

// This should be an empty function, and any initialization should be done lazily
function ComponentElement(): ComponentElement {}

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
        // custom elements will rely on the DOM dispatchEvent mechanism
        return elm.dispatchEvent(event);
    },
    addEventListener(type: string, listener: EventListener) {
        const vnode = getLinkedVNode(this);
        assert.vnode(vnode);
        const { vm } = vnode;
        assert.vm(vm);
        assert.block(function devModeCheck() {
            if (arguments.length > 2) {
                // TODO: can we synthetically implement `passive` and `once`? Capture is probably ok not supporting it.
                console.error(`this.addEventListener() on ${vm} does not support more than 2 arguments. Options to make the listener passive, once or capture are not allowed at the top level of the component's fragment.`);
            }
        });
        addComponentEventListener(vm, type, listener);
    },
    removeEventListener(type: string, listener: EventListener) {
        const vnode = getLinkedVNode(this);
        assert.vnode(vnode);
        const { vm } = vnode;
        assert.vm(vm);
        assert.block(function devModeCheck() {
            if (arguments.length > 2) {
                console.error(`this.removeEventListener() on ${vm} does not support more than 2 arguments. Options to make the listener passive or capture are not allowed at the top level of the component's fragment.`);
            }
        });
        removeComponentEventListener(vm, type, listener);
    },
    getAttribute(attrName: string): string | null {
        const vnode = getLinkedVNode(this);
        assert.vnode(vnode);
        const { data: { attrs }, vm } = vnode;
        assert.vm(vm);
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
        return elm.getBoundingClientRect();
    },
    querySelector(selectors: string): Element {
        const elm = getLinkedElement(this);
        // TODO: locker service might need to do something here
        // TODO: filter out elements that you don't own
        return elm.querySelector(selectors);
    },
    querySelectorAll(selectors: string): NodeList {
        const elm = getLinkedElement(this);
        // TODO: locker service might need to do something here
        // TODO: filter out elements that you don't own
        return elm.querySelectorAll(selectors);
    },
    get tagName(): string {
        const element = getLinkedElement(this);
        return element.tagName + ''; // avoiding side-channeling
    },
    get classList(): DOMTokenList {
        const vnode = getLinkedVNode(this);
        assert.vnode(vnode);
        const { vm } = vnode;
        assert.vm(vm);
        let { classListObj } = vm;
        // lazy creation of the ClassList Object the first time it is accessed.
        if (isUndefined(classListObj)) {
            classListObj = new ClassList(vm);
            vm.classListObj = classListObj;
        }
        return classListObj;
    },
    get state(): HashTable<any> {
        const vnode = getLinkedVNode(this);
        assert.vnode(vnode);
        const { vm } = vnode;
        assert.vm(vm);
        let { cmpState } = vm;
        if (isUndefined(cmpState)) {
            cmpState = vm.cmpState = getPropertyProxy(create(null)); // lazy creation of the cmpState
        }
        return cmpState;
    },
    set state(newState: HashTable<any>) {
        const vnode = getLinkedVNode(this);
        assert.vnode(vnode);
        const { vm } = vnode;
        assert.vm(vm);
        if (!newState || !isObject(newState) || isArray(newState)) {
            throw new TypeError(`${vm} failed to set new state to ${newState}. \`this.state\` can only be set to an object.`);
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
        const vnode = getLinkedVNode(this);
        assert.vnode(vnode);
        const { data: { attrs } } = vnode;
        const is = attrs && attrs.is;
        return `<${vnode.sel}${ is ? ' is="${is}' : '' }>`;
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
                const vnode = getLinkedVNode(this);
                assert.vnode(vnode);
                const { vm } = vnode;
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

import assert from "./assert.js";
import { scheduleRehydration, getLinkedVNode } from "./vm.js";
import { ClassList } from "./class-list.js";
import { addComponentEventListener, removeComponentEventListener } from "./component.js";
import { markComponentAsDirty } from "./component.js";
import { isArray, freeze, seal, defineProperty, getOwnPropertyNames, isUndefined, isObject } from "./language.js";
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
        assert.block(() => {
            if (arguments.length > 2) {
                console.error(`this.addEventListener() on component ${vm} does not support more than 2 arguments. Options to make the listener passive, once or capture are not allowed at the top level of the component's fragment.`);
            }
        });
        addComponentEventListener(vm, type, listener);
        if (vm.isDirty) {
            console.log(`Scheduling ${vm} for rehydration due to the addition of an event listener for ${type}.`);
            scheduleRehydration(vm);
        }
    },
    removeEventListener(type: string, listener: EventListener) {
        const vnode = getLinkedVNode(this);
        assert.vnode(vnode);
        const { vm } = vnode;
        assert.vm(vm);
        assert.block(() => {
            if (arguments.length > 2) {
                console.error(`this.removeEventListener() on component ${vm} does not support more than 2 arguments. Options to make the listener passive or capture are not allowed at the top level of the component's fragment.`);
            }
        });
        removeComponentEventListener(vm, type, listener);
        if (vm.isDirty) {
            console.log(`Scheduling ${vm} for rehydration due to the removal of an event listener for ${type}.`);
            scheduleRehydration(vm);
        }
    },
    getAttribute(attrName: string): string | null {
        const vnode = getLinkedVNode(this);
        assert.vnode(vnode);
        const { data: { attrs }, vm } = vnode;
        assert.vm(vm);
        if (!attrName) {
            if (arguments.length === 0) {
                throw new TypeError(`Failed to execute 'getAttribute' on ${vm}: 1 argument required, but only 0 present.`);
            }
            return null;
        }
        // logging errors for experimentals and special attributes
        assert.block(() => {
            const propName = getPropNameFromAttrName(attrName);
            const { def: { props: publicPropsConfig } } = vm;
            if (publicPropsConfig[propName]) {
                throw new ReferenceError(`Attribute "${attrName}" correspond to public property ${propName} from ${vm}. Instead of trying to access it via \`this.getAttribute("${attrName}")\` you should use \`this.${propName}\` instead. Use \`getAttribute()\` only to access global HTML attributes.`);
            } else if (GlobalHTMLProperties[propName] && GlobalHTMLProperties[propName].attribute) {
                const { error, experimental } = GlobalHTMLProperties[propName];
                if (error) {
                    console.error(error);
                } else if (experimental) {
                    console.error(`Writing logic that relies on experimental attribute "${attrName}" is discouraged, until this feature is standarized and supported by all evergreen browsers. Property \`${propName}\` and attribute "${attrName}" will be ignored by this engine to prevent you from producing non-standard components.`);
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
        return getPropertyProxy(vm.cmpState);
    },
    set state(newState: HashTable<any>) {
        const vnode = getLinkedVNode(this);
        assert.vnode(vnode);
        const { vm } = vnode;
        assert.vm(vm);
        if (!isObject(newState) || isArray(newState)) {
            throw new TypeError(`${vm} fails to set new state to ${newState}. \`this.state\` can only be set to an object.`);
        }
        vm.cmpState = Object.assign({}, newState);
        if (!vm.isDirty) {
            markComponentAsDirty(vm);
            console.log(`Scheduling ${vm} for rehydration due to changes in the state object assignment.`);
            scheduleRehydration(vm);
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
assert.block(() => {

    getOwnPropertyNames(GlobalHTMLProperties).forEach((propName: string) => {
        if (propName in ComponentElement.prototype) {
            return; // not need to redefined something that we are already exposing.
        }
        defineProperty(ComponentElement.prototype, propName, {
            get: function () {
                const vnode = getLinkedVNode(this);
                assert.vnode(vnode);
                const { vm } = vnode;
                assert.vm(vm);
                const { error, attribute, readOnly, experimental } = GlobalHTMLProperties[propName];
                const msg = [];
                msg.push(`Accessing the reserved property \`${propName}\` in ${vm} is disabled.`);
                if (error) {
                    msg.push(error);
                } else {
                    if (experimental) {
                        msg.push(`* Writing logic that relies on experimental property \`${propName}\` is discouraged, until this feature is standarized and supported by all evergreen browsers. Property \`${propName}\` and attribute "${attribute}" will be ignored by this engine to prevent you from producing non-standard components.`);
                    }
                    if (readOnly) {
                        msg.push(`* Read-only property derivated from attributes, it is better to rely on the original source of the value.`);
                    }
                    if (attribute) {
                        msg.push(`You cannot access to the value of the global property \`${propName}\` directly, but since this property is reflective of attribute "${attribute}", you have two options to can access to the attribute value:`);
                        msg.push(`  * Use \`this.getAttribute("${attribute}")\` to access the attribute value at any given time. This option is more suitable for accessing the value in a getter during the rendering process.`);
                        msg.push(`  * Declare \`static observedAttributes = ["${attribute}"]\` and then use the \`attributeChangedCallback(attrName, oldValue, newValue)\` to get a notification every time the attribute "${attribute}" changes. This option is more suitable for reactive programming, e.g.: fetching new content every time the attribute is updated.`);
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

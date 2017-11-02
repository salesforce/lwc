import assert from "./assert";
import { ClassList } from "./class-list";
import { Root, shadowRootQuerySelector, shadowRootQuerySelectorAll } from "./root";
import { vmBeingConstructed, isBeingConstructed, addComponentEventListener, removeComponentEventListener } from "./component";
import { ArrayFilter, freeze, seal, defineProperty, getOwnPropertyNames, isUndefined } from "./language";
import { GlobalHTMLProperties } from "./dom";
import { getPropNameFromAttrName, noop, toAttributeValue } from "./utils";
import { isRendering, vmBeingRendered } from "./invoker";
import { wasNodePassedIntoVM } from "./vm";
import { pierce } from "./piercing";
import { ViewModelReflection } from "./def";

function getLinkedElement(cmp: ComponentElement): HTMLElement {
    return cmp[ViewModelReflection].vnode.elm;
}

function querySelectorAllFromComponent(cmp: ComponentElement, selectors: string): NodeList {
    const elm = getLinkedElement(cmp);
    return elm.querySelectorAll(selectors);
}

// This should be as performant as possible, while any initialization should be done lazily
function ComponentElement(): ComponentElement {
    assert.vm(vmBeingConstructed);
    assert.vnode(vmBeingConstructed.vnode);
    const vnode = vmBeingConstructed.vnode;
    assert.invariant(vnode.elm instanceof HTMLElement, `Component creation requires a DOM element to be associated to ${vnode}.`);
    vmBeingConstructed.component = this;
    this[ViewModelReflection] = vmBeingConstructed;
}
/*eslint-disable*/
interface ComposableEvent extends Event {
    composed: boolean
}
/*eslint-disable*/
ComponentElement.prototype = {
    // Raptor.Element APIs
    renderedCallback: noop,
    render: noop,

    // Web Component - The Good Parts
    connectedCallback: noop,
    disconnectedCallback: noop,

    // HTML Element - The Good Parts
    dispatchEvent(event: ComposableEvent): boolean {
        const elm = getLinkedElement(this);
        assert.block(() => {
            const { type: evtName, composed, bubbles } = event;
            const vm = this[ViewModelReflection];
            assert.isFalse(isBeingConstructed(vm), `this.dispatchEvent() should not be called during the construction of the custom element for ${this} because no one is listening for the event "${evtName}" just yet.`);
            if (bubbles && !composed) {
                assert.logWarning(`Invalid event "${evtName}" dispatched in element ${this}. Events with 'bubbles: true' must also be 'composed: true'. Without 'composed: true', the dispatched event will not be observable outside of your component.`);
            }
            if (vm.idx === 0) {
                assert.logWarning(`Unreachable event "${evtName}" dispatched from disconnected element ${this}. Events can only reach the parent element after the element is connected (via connectedCallback) and before the element is disconnected(via disconnectedCallback).`);
            }

            if (!evtName.match(/^[a-z]+([a-z0-9]+)?$/)) {
                assert.logWarning(`Invalid event type: '${evtName}' dispatched in element ${this}. Event name should only contain lowercase alphanumeric characters.`);
            }
        });
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
    querySelector(selectors: string): Node | null {
        const vm = this[ViewModelReflection];
        assert.isFalse(isBeingConstructed(vm), `this.querySelector() cannot be called during the construction of the custom element for ${this} because no children has been added to this element yet.`);
        const nodeList = querySelectorAllFromComponent(this, selectors);
        for (let i = 0, len = nodeList.length; i < len; i += 1) {
            if (wasNodePassedIntoVM(vm, nodeList[i])) {
                // TODO: locker service might need to return a membrane proxy
                return pierce(vm, nodeList[i]);
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
        return pierce(vm, filteredNodes);
    },
    get tagName(): string {
        const elm = getLinkedElement(this);
        return elm.tagName + ''; // avoiding side-channeling
    },
    get tabIndex(): number {
        const elm = getLinkedElement(this);
        return elm.tabIndex;
    },
    set tabIndex(value: number) {
        const vm = this[ViewModelReflection];
        assert.vm(vm);
        assert.isFalse(isRendering, `Setting property "tabIndex" of ${toString(value)} during the rendering process of ${vmBeingRendered} is invalid. The render phase must have no side effects on the state of any component.`);

        if (isBeingConstructed(vm)) {
            assert.fail(`Setting property "tabIndex" during the construction process of ${vm} is invalid.`);
            return;
        }

        const elm = getLinkedElement(this);
        elm.tabIndex = value;
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

import { ComponentConstructor } from "./component";
import { isUndefined, isObject, isNull, defineProperties, StringToLowerCase, getOwnPropertyNames } from "../shared/language";
import { createVM, appendVM, renderVM, removeVM, getCustomElementVM, CreateVMInit } from "./vm";
import { resolveCircularModuleDependency, isCircularModuleDependency } from "./utils";
import { getComponentDef } from "./def";
import { elementTagNameGetter } from "./dom-api";
import { getPropNameFromAttrName, isAttributeLocked } from "./attributes";

export function buildCustomElementConstructor(Ctor: ComponentConstructor, options?: ShadowRootInit): Function {
    if (isCircularModuleDependency(Ctor)) {
        Ctor = resolveCircularModuleDependency(Ctor);
    }
    const { props, descriptors } = getComponentDef(Ctor);
    const normalizedOptions: CreateVMInit = { fallback: false, mode: 'open', isRoot: true };
    if (isObject(options) && !isNull(options)) {
        const { mode, fallback } = (options as any);
        // TODO: for now, we default to open, but eventually it should default to 'closed'
        if (mode === 'closed') { normalizedOptions.mode = mode; }
        // fallback defaults to false to favor shadowRoot
        if (fallback === true) { normalizedOptions.fallback = true; }
    }
    class LightningWrapperElement extends HTMLElement {
        constructor() {
            super();
            const tagName = StringToLowerCase.call(elementTagNameGetter.call(this));
            createVM(tagName, this, Ctor, normalizedOptions);
        }
        connectedCallback() {
            const vm = getCustomElementVM(this);
            appendVM(vm);
            renderVM(vm);
        }
        disconnectedCallback() {
            const vm = getCustomElementVM(this);
            removeVM(vm);
        }
        attributeChangedCallback(attrName, oldValue, newValue) {
            if (oldValue === newValue) {
                // ignoring similar values for better perf
                return;
            }
            const propName = getPropNameFromAttrName(attrName);
            if (isUndefined(props[propName])) {
                // ignoring unknown attributes
                return;
            }
            if (!isAttributeLocked(this, attrName)) {
                // ignoring changes triggered by the engine itself during:
                // * diffing when public props are attempting to reflect to the DOM
                // * component via `this.setAttribute()`, should never update the prop.
                // Both cases, the the setAttribute call is always wrap by the unlocking
                // of the attribute to be changed
                return;
            }
            // reflect attribute change to the corresponding props when changed
            // from outside.
            this[propName] = newValue;
        }
        static observedAttributes = getOwnPropertyNames(props);
    }
    // adding all public descriptors to the prototype so we don't have to
    // do it per instance in html-element.ts constructors
    defineProperties(LightningWrapperElement.prototype, descriptors);
    return LightningWrapperElement;
}

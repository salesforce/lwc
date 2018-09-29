import { ComponentConstructor } from "./component";
import { isUndefined, isObject, isNull, StringToLowerCase, getOwnPropertyNames, isTrue, isFalse, ArrayMap } from "../shared/language";
import { createVM, appendVM, renderVM, removeVM, getCustomElementVM, CreateVMInit } from "./vm";
import { resolveCircularModuleDependency, isCircularModuleDependency } from "./utils";
import { getComponentDef } from "./def";
import { elementTagNameGetter, isNativeShadowRootAvailable } from "./dom-api";
import { getPropNameFromAttrName, isAttributeLocked } from "./attributes";
import { patchCustomElementProto } from "./patch";
import { HTMLElementConstructor } from "./base-html-element";

export function buildCustomElementConstructor(Ctor: ComponentConstructor, options?: ShadowRootInit): HTMLElementConstructor {
    if (isCircularModuleDependency(Ctor)) {
        Ctor = resolveCircularModuleDependency(Ctor);
    }
    const { props, bridge: BaseElement } = getComponentDef(Ctor);
    const normalizedOptions: CreateVMInit = { fallback: false, mode: 'open', isRoot: true };
    if (isObject(options) && !isNull(options)) {
        const { mode, fallback } = (options as any);
        // TODO: for now, we default to open, but eventually it should default to 'closed'
        if (mode === 'closed') { normalizedOptions.mode = mode; }
        // fallback defaults to false to favor shadowRoot
        normalizedOptions.fallback = isTrue(fallback) || isFalse(isNativeShadowRootAvailable);
    }
    return class extends BaseElement {
        constructor() {
            super();
            const tagName = StringToLowerCase.call(elementTagNameGetter.call(this));
            if (isTrue(normalizedOptions.fallback)) {
                const def = getComponentDef(Ctor);
                patchCustomElementProto(this, tagName, def);
            }
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
        // collecting all attribute names from all public props to apply
        // the reflection from attributes to props via attributeChangedCallback.
        static observedAttributes = ArrayMap.call(getOwnPropertyNames(props), (propName) => props[propName].attr);
    };
}

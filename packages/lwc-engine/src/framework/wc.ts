import { ComponentConstructor } from "./component";
import { isUndefined, isObject, isNull, defineProperties } from "./language";
import { createVM, appendVM, renderVM, removeVM, getCustomElementVM, CreateVMInit } from "./vm";
import assert from "./assert";
import { resolveCircularModuleDependency, isCircularModuleDependency } from "./utils";
import { getComponentDef } from "./def";

export function buildCustomElementConstructor(Ctor: ComponentConstructor, options?: ShadowRootInit): Function {
    if (isCircularModuleDependency(Ctor)) {
        Ctor = resolveCircularModuleDependency(Ctor);
    }
    const def = getComponentDef(Ctor);
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isUndefined(Ctor.forceTagName), `The experimental support for web components does not include the support for \`static forceTagName\` to "${Ctor.forceTagName}" declaration in the class definition for ${Ctor}.`);
    }
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
            const tagName = this.tagName.toLocaleLowerCase();
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
    }
    // adding all public descriptors to the prototype so we don't have to
    // do it per instance in html-element.ts constructors
    defineProperties(LightningWrapperElement.prototype, def.descriptors);
    return LightningWrapperElement;
}

import { ComponentConstructor } from "./component";
import { isUndefined, isObject, isNull } from "./language";
import { createVM, appendVM, renderVM, removeVM, getCustomElementVM } from "./vm";
import assert from "./assert";
import { resolveCircularModuleDependency } from "./utils";

export function customElement(Ctor: ComponentConstructor, options?: Record<string, boolean>): Function {
    Ctor = resolveCircularModuleDependency(Ctor);
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isUndefined(Ctor.forceTagName), `The experimental support for web components does not include the support for \`static forceTagName\` to "${Ctor.forceTagName}" declaration in the class definition for ${Ctor}.`);
    }
    const normalizedOptions = { fallback: false, mode: 'open', isRoot: true };
    if (isObject(options) && !isNull(options)) {
        const { mode, fallback } = (options as any);
        // TODO: for now, we default to open, but eventually it should default to 'closed'
        if (mode === 'closed') { normalizedOptions.mode = mode; }
        // fallback defaults to false to favor shadowRoot
        if (fallback === true) { normalizedOptions.fallback = true; }
    }
    return class extends HTMLElement {
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
    };
}

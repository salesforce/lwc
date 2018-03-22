import { getComponentDef, registerComponent } from "./def";
import { ComponentConstructor } from "./component";
import { isUndefined } from "./language";
import { createVM, appendVM, renderVM, removeVM } from "./vm";
import { getCustomElementVM } from "./html-element";
import assert from "./assert";

export function customElement(Ctor: ComponentConstructor): Function {
    let mustBeRegistered = true;
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isUndefined(Ctor.forceTagName), `The experimental support for web components does not include the support for \`static forceTagName\` to "${Ctor.forceTagName}" declaration in the class definition for ${Ctor}.`);
    }
    return class extends HTMLElement {
        constructor() {
            super();
            const tagName = this.tagName.toLocaleLowerCase();
            if (mustBeRegistered) {
                mustBeRegistered = false;
                registerComponent(tagName, Ctor);
            }
            createVM(tagName, this);
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

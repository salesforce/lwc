export { createElement } from "./upgrade";
export { getComponentDef } from "./def";
export { LightningElement } from "./html-element";
export { register } from "./services";
export { unwrap } from "./membrane";
export { default as api } from "./decorators/api";
export { default as track } from "./decorators/track";
export { default as wire } from "./decorators/wire";

// backward compatibility
// TODO: remove this in 0.19.x
import { LightningElement } from "./html-element";
import assert from "./assert";
export class Element extends LightningElement {
    constructor() {
        super();
        assert.logWarning(`Deprecation Notice: \`import { Element } from "engine";\` is now deprecated. Instead, use \`import { LightingElement } from "engine";\``);
    }
}

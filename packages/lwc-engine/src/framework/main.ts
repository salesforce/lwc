// TODO: Revisit all of this exports figure out a better separation
export { createElement } from "./upgrade";
export { getComponentDef, isComponentConstructor, getComponentConstructor } from "./def";
export { BaseLightningElement as LightningElement } from "./base-lightning-element";
export { register } from "./services";
export { unwrap } from "./membrane";
export { registerTemplate } from "./template";

// TODO: REMOVE THIS https://github.com/salesforce/lwc/issues/129
export { dangerousObjectMutation } from "./membrane";

export { default as api } from "./decorators/api";
export { default as track } from "./decorators/track";
export { default as readonly } from "./decorators/readonly";
export { default as wire } from "./decorators/wire";
export { default as decorate } from "./decorators/decorate";
export { buildCustomElementConstructor } from "./wc";

// Deprecated APIs
export { BaseLightningElement as Element } from "./base-lightning-element";

import "../polyfills/proxy-concat/main";

export { createElement } from "./upgrade";
export { getComponentDef } from "./def";
export { Element } from "./html-element";
export { register } from "./services";
export { unwrap } from "./membrane";

// wire adapter
export { register as registerAdapter } from './component';
export { ValueChangedEvent } from './wiring';

// TODO: REMOVE THIS https://github.com/salesforce/lwc/issues/129
export { dangerousObjectMutation } from "./membrane";
export { default as api } from "./decorators/api";
export { default as track } from "./decorators/track";
export { default as readonly } from "./decorators/readonly";
export { default as wire } from "./decorators/wire";

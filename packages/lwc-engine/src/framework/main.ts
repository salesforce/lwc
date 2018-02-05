export { createElement } from "./upgrade";
export { getComponentDef } from "./def";
export { Element } from "./html-element";
export { register } from "./services";
export { unwrap } from "./membrane";
// Temporary export for locker, will be removed once the shadow-dom polyfil is available
export { isNodeOwnedByComponent } from "./root";
export { default as api } from "./decorators/api";
export { default as track } from "./decorators/track";
export { default as wire } from "./decorators/wire";

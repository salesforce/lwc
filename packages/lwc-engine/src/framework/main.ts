export { createElement } from "./upgrade";
export { getComponentDef } from "./def";
export { Element } from "./html-element";
export { register } from "./services";
export { unwrap } from "./reactive";

// TODO: REMOVE THIS ONCE WE ENABLE PARENT PROP MUTATION
export { dangerousObjectMutation } from "./reactive";
export { default as api } from "./decorators/api";
export { default as track } from "./decorators/track";
export { default as wire } from "./decorators/wire";

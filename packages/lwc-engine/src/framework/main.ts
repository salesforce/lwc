export { createElement } from "./upgrade";
export { getComponentDef } from "./def";
export { Element } from "./html-element";
export { register } from "./services";
export { unwrap } from "./reactive";

// TODO: REMOVE THIS https://github.com/salesforce/lwc/issues/129
export { dangerousObjectMutation } from "./reactive";
export { default as api } from "./decorators/api";
export { default as track } from "./decorators/track";
export { default as wire } from "./decorators/wire";

// TODO: REMOVE THIS https://github.com/salesforce/lwc/issues/153
import { membrane } from "./reactive";
export function createReadOnlyObject(obj: any): any {
    return membrane.getReadOnlyProxy(obj);
}

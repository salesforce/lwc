// @flow

import {
    h,
    v,
} from "./api.js";

import {
    flattenElements,
    EmptyObject,
    EmptyArray,
} from "./utils.js";

export default function createElement(ComponentCtorOrTagName: any, attrs: any = EmptyObject, children: Array<any> = EmptyArray): Object {
    const isHTMLTagName = typeof ComponentCtorOrTagName === "string";
    children = flattenElements(children);
    if (isHTMLTagName) {
        return h(ComponentCtorOrTagName, attrs, children);
    } else {
        return v(ComponentCtorOrTagName, attrs, children);
    }
}

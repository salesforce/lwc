// @flow

import {
    h,
    v,
} from "./api.js";

import {
    EmptyObject,
    EmptyArray,
} from "./utils.js";

export default function createElement(ComponentCtorOrTagName: any, attrs: any = EmptyObject, children: Array<any> = EmptyArray): Object {
    const isHTMLTagName = typeof ComponentCtorOrTagName === "string";
    if (!Array.isArray(children)) {
        throw new Error(`The 3rd argument of createElement() should be an array instead of ${children}.`);
    }
    if (isHTMLTagName) {
        return h(ComponentCtorOrTagName, attrs, children);
    } else {
        return v(ComponentCtorOrTagName, attrs, children);
    }
}

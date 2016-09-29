// @flow

import {
    h,
    v,
} from "./api.js";

export default function createElement(ComponentCtorOrTagName: any, attrs: any, children: any): Object {
    const isHTMLTagName = typeof ComponentCtorOrTagName === "string";
    if (isHTMLTagName) {
        return h(ComponentCtorOrTagName, attrs, children);
    } else {
        return v(ComponentCtorOrTagName, { a: attrs }, children);
    }
}

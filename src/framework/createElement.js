// @flow

import {
    h,
    v,
} from "./api.js";

export default function createElement(ComponentCtorOrTagName: any, data: any, children: any): Object {
    const isHTMLTagName = typeof ComponentCtorOrTagName === "string";
    return (isHTMLTagName ? h : v)(ComponentCtorOrTagName, data, children);
}

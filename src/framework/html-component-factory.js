/* @flow */

import {
    renderComponent,
    computeTree,
} from "./rendering.js";

import {
    opaqueToComponentMap,
} from "./createElement";

import {
    createElement,
    releaseNode,
    updateAttr,
} from "dom";

const cache = {};
const HTMLComponentSet = new WeakSet();

export function isHTMLComponent(component: Object): boolean {
    return HTMLComponentSet.has(component);
}

export default function HTMLComponentFactory(tagName: string): Class {
    if (!cache[tagName]) {
        // instances of this class will never be exposed to user-land
        cache[tagName] = class HTMLComponent {
            constructor(attrs: Object) {
                this.tagName = tagName;
                this.attrs = attrs;
                this.domNode = undefined;
                HTMLComponentSet.add(this);
            }
            attach() {
                // TODO: support for two ways data binding
            }
            dettach() {
                releaseNode(this.domNode);
                this.domNode = undefined;
            }
            render(): any {
                this.domNode = createElement(this.tagName);
                for (let [attrName, attrVal] of Object.entries(this.attrs)) {
                    if (attrName !== 'children') {
                        updateAttr(this.domNode, attrName, attrVal);
                    }
                }
                let children = this.attrs.children || [];
                const len = children.length;
                let i = 0;
                for (i; i < len; i += 1) {
                    let opaque = children[i];
                    if (typeof opaque === 'string') {
                        this.domNode.appendChild(document.createTextNode(opaque));
                    } else if (opaque !== null) {
                        const childComponent = opaqueToComponentMap.get(opaque);
                        renderComponent(childComponent);
                        const tree = computeTree(childComponent);
                        this.domNode.appendChild(tree);
                    }
                }
                return null;
            }
        };
    }
    return cache[tagName];
}

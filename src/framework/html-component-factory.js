import {
    isDirty,
    componentWasRehydrated,
} from "./rendering.js";

import {
    createElement,
    releaseNode,
    updateAttr,
} from "dom";

const cache = {};

export default function HTMLComponentFactory(tagName) {
    if (!cache[tagName]) {
        // instances of this class will never be exposed to user-land
        // instead, a proxy to them will be used, which can deal with
        // the marks to dirty, and the state on attrs.
        cache[tagName] = class HTMLComponent {
            constructor(attrs) {
                this.tagName = tagName;
                this.attrs = attrs;
                this.domNode = undefined;
            }
            dettach() {
                releaseNode(this.domNode);
                this.domNode = undefined;
            }
            render() {
                // TODO: two ways data binding will have to be implemented
                //       for inputs and other live elements.
                const rehydrate = () => {
                    for (let {attrName, attrVal} of this.attrs) {
                        if (isDirty(this, attrName)) {
                            updateAttr(this.domNode, attrName, attrVal);
                        }
                    }
                    componentWasRehydrated(this);
                    return this.domNode;
                };
                const render = () => {
                    this.domNode = createElement(this.tagName);
                    for (let {attrName, attrVal} of this.attrs) {
                        updateAttr(this.domNode, attrName, attrVal);
                    }
                    return this.domNode;
                };
                return isDirty(this) && this.domNode ? rehydrate() : render();
            }
        };
    }
    return cache[tagName];
}

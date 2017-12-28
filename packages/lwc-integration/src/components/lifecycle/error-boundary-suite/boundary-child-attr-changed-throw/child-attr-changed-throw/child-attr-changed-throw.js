import { Element } from 'engine'

export default class ChildAttrChangedThrow extends Element {
    static observedAttributes = ['title'];

    attributeChangedCallback(attrName, oldVal, newVal) {
        if (newVal === 'new title') {
            throw new Error("Child threw in attributeChangedCallback");
        }
    }
}

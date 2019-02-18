import { LightningElement, track } from 'lwc';

export default class CustomElementChildren extends LightningElement {
    @track childrenLength;
    @track childNodesLength;
    @track shadowChildrenLength;
    @track shadowChildNodesLength;
    @track childElementCount;
    @track shadowRootChildElementCount;

    renderedCallback() {
        if (this.childrenLength === undefined) {
            this.childrenLength = this.template.host.children.length;
            this.childNodesLength = this.template.host.childNodes.length;

            this.shadowChildrenLength = this.template.children.length;
            this.shadowChildNodesLength = this.template.childNodes.length;
            this.childElementCount = this.template.host.childElementCount;
            this.shadowRootChildElementCount = this.template.childElementCount;
        }
    }
}

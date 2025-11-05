import { LightningElement } from 'lwc';

export default class Container extends LightningElement {
    renderList = false;
    items = [{ id: 1 }];
    connectedCallback() {
        // do nothing
    }

    renderedCallback() {
        // do nothing
    }

    errorCallback() {
        // do nothing
    }

    enableList() {
        this.renderList = true;
    }
}

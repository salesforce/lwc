import { api, LightningElement } from 'lwc';

export default class extends LightningElement {
    @api
    items = [
        { id: 'item1', value: 'Item 1' },
        { id: 'item2', value: 'Item 2' },
        { id: 'item3', value: 'Item 3' },
    ];

    @api
    connectedCallbackCalled = 0;

    @api
    disconnectedCallbackCalled = 0;

    @api
    renderedCallbackCalled = 0;

    connectedCallback() {
        this.connectedCallbackCalled++;
    }

    disconnectedCallback() {
        this.disconnectedCallbackCalled++;
    }

    renderedCallback() {
        this.renderedCallbackCalled++;
    }
}

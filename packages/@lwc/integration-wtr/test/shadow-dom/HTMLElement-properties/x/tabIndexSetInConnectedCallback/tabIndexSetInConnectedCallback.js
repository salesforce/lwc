import { LightningElement, api } from 'lwc';

export default class MyComponent extends LightningElement {
    @api
    renderCount = 0;
    connectedCallback() {
        this.tabIndex = 2;
    }

    @api
    getTabIndex() {
        return this.tabIndex;
    }

    renderedCallback() {
        this.renderCount += 1;
    }

    @api
    getRenderCount() {
        return this.renderCount;
    }
}

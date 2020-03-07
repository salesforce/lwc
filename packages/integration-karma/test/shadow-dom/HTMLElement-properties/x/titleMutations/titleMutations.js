import { LightningElement, api } from 'lwc';
export let titleSetterCounter = 0;
export let titleRenderCounter = 0;
export let titleGetterCounter = 0;
export default class MyComponent extends LightningElement {
    constructor() {
        super();
        titleSetterCounter = 0;
        titleRenderCounter = 0;
        titleGetterCounter = 0;
    }

    @api
    set title(value) {
        titleSetterCounter += 1;
    }
    get title() {
        titleGetterCounter += 1;
        return 'title';
    }

    renderedCallback() {
        titleRenderCounter += 1;
    }
}

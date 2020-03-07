import { LightningElement, api } from 'lwc';
export let dirSetterCounter = 0;
export let dirRenderCounter = 0;
export let dirGetterCounter = 0;
export default class MyComponent extends LightningElement {
    constructor() {
        super();
        dirSetterCounter = 0;
        dirRenderCounter = 0;
        dirGetterCounter = 0;
    }

    @api
    set dir(value) {
        dirSetterCounter += 1;
    }
    get dir() {
        dirGetterCounter += 1;
        return 'ltr';
    }

    renderedCallback() {
        dirRenderCounter += 1;
    }
}

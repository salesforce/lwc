import { LightningElement, api } from 'lwc';
export let hiddenSetterCounter = 0;
export let hiddenRenderCounter = 0;
export let hiddenGetterCounter = 0;
export default class MyComponent extends LightningElement {
    constructor() {
        super();
        hiddenSetterCounter = 0;
        hiddenRenderCounter = 0;
        hiddenGetterCounter = 0;
    }

    @api
    set hidden(value) {
        hiddenSetterCounter += 1;
    }
    get hidden() {
        hiddenGetterCounter += 1;
        return 'hidden';
    }

    renderedCallback() {
        hiddenRenderCounter += 1;
    }
}

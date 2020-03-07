import { LightningElement, api } from 'lwc';
export let idSetterCounter = 0;
export let idRenderCounter = 0;
export let idGetterCounter = 0;
export default class MyComponent extends LightningElement {
    constructor() {
        super();
        idSetterCounter = 0;
        idRenderCounter = 0;
        idGetterCounter = 0;
    }

    @api
    set id(value) {
        idSetterCounter += 1;
    }
    get id() {
        idGetterCounter += 1;
        return 'id';
    }

    renderedCallback() {
        idRenderCounter += 1;
    }
}

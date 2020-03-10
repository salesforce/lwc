import { LightningElement, api } from 'lwc';
export let attributeSetterCounter = 0;
export let attributeRenderCounter = 0;
export let attributeGetterCounter = 0;

export function resetCounters() {
    attributeSetterCounter = 0;
    attributeRenderCounter = 0;
    attributeGetterCounter = 0;
}
export default class MyComponent extends LightningElement {
    constructor() {
        super();
    }

    @api
    set dir(value) {
        attributeSetterCounter += 1;
    }
    get dir() {
        attributeGetterCounter += 1;
        return 'ltr';
    }

    @api
    set accessKey(value) {
        attributeSetterCounter += 1;
    }
    get accessKey() {
        attributeGetterCounter += 1;
        return 'accessKey';
    }

    @api
    set hidden(value) {
        attributeSetterCounter += 1;
    }
    get hidden() {
        attributeGetterCounter += 1;
        return 'true';
    }

    @api
    set id(value) {
        attributeSetterCounter += 1;
    }
    get id() {
        attributeGetterCounter += 1;
        return 'id';
    }

    @api
    set lang(value) {
        attributeSetterCounter += 1;
    }
    get lang() {
        attributeGetterCounter += 1;
        return 'en';
    }

    @api
    set title(value) {
        attributeSetterCounter += 1;
    }
    get title() {
        attributeGetterCounter += 1;
        return 'title';
    }

    renderedCallback() {
        attributeRenderCounter += 1;
    }
}

import { LightningElement, api } from 'lwc';
export let accessKeySetterCounter = 0;
export let accessKeyRenderCounter = 0;
export let accessKeyGetterCounter = 0;
export default class MyComponent extends LightningElement {
    constructor() {
        super();
        accessKeySetterCounter = 0;
        accessKeyRenderCounter = 0;
        accessKeyGetterCounter = 0;
    }

    @api
    set accessKey(value) {
        accessKeySetterCounter += 1;
    }
    get accessKey() {
        accessKeyGetterCounter += 1;
        return 'accessKey';
    }

    renderedCallback() {
        accessKeyRenderCounter += 1;
    }
}

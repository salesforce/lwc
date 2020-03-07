import { LightningElement, api } from 'lwc';
export let langSetterCounter = 0;
export let langRenderCounter = 0;
export let langGetterCounter = 0;
export default class MyComponent extends LightningElement {
    constructor() {
        super();
        langSetterCounter = 0;
        langRenderCounter = 0;
        langGetterCounter = 0;
    }

    @api
    set lang(value) {
        langSetterCounter += 1;
    }
    get lang() {
        langGetterCounter += 1;
        return 'lang';
    }

    renderedCallback() {
        langRenderCounter += 1;
    }
}

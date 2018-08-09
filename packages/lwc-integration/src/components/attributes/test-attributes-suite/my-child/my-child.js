import { LightningElement, api } from "lwc"

export default class Child extends LightningElement {
    constructor() {
        super();
    }

    @api
    get getTabindexAttr() {
        return this.getAttribute('tabindex');
    }

    @api
    get getTitleAttr() {
        return this.getAttribute('title');
    }
}

import { LightningElement, api } from 'lwc';

export default class Child extends LightningElement {
    @api
    componentQuerySelector(...args) {
        return this.querySelector(...args);
    }

    @api
    componentQuerySelectorAll(...args) {
        return this.querySelectorAll(...args);
    }

    @api
    componentGetElementsByTagName(...args) {
        return this.getElementsByTagName(...args);
    }

    @api
    componentGetElementsByClassName(...args) {
        return this.getElementsByClassName(...args);
    }
}

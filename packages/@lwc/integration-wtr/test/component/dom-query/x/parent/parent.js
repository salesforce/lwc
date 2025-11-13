import { LightningElement, api } from 'lwc';

export default class Parent extends LightningElement {
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

    @api
    componentChildren() {
        return this.children;
    }

    @api
    componentChildNodes() {
        return this.childNodes;
    }

    @api
    componentFirstChild() {
        return this.firstChild;
    }

    @api
    componentFirstElementChild() {
        return this.firstElementChild;
    }

    @api
    componentLastChild() {
        return this.lastChild;
    }

    @api
    componentLastElementChild() {
        return this.lastElementChild;
    }
}

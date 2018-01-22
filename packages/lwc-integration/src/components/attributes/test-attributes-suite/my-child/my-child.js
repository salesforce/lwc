import { Element } from 'engine'

export default class Child extends Element {
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

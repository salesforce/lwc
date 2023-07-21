import { LightningElement } from 'lwc';

export default class TagName extends LightningElement {
    constructor() {
        super();
        this._tagName = this.tagName;
    }

    get test() {
        return this._tagName;
    }
}

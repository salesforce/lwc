import { LightningElement } from 'lwc';
export default class Test extends LightningElement {
    get #value() {
        return this._val;
    }
}

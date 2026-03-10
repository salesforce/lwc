import { LightningElement } from 'lwc';
export default class Test extends LightningElement {
    set #value(v) {
        this._val = v;
    }
}

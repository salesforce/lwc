import { LightningElement, api } from 'lwc';

const marker = Symbol.for('@@lockerLiveValue');

export default class Foo extends LightningElement {
    @api hasMarker() {
        return Object.hasOwnProperty.call(this, marker);
    }
}

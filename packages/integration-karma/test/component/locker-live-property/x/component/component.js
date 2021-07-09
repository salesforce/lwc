import { LightningElement } from 'lwc';

export default class extends LightningElement {
    get isLiveObject() {
        // See https://github.com/salesforce/locker/blob/7ae9538/packages/%40locker/shared/src/LiveObject.ts#L18
        return Object.prototype.hasOwnProperty.call(this, Symbol.for('@@lockerLiveValue'));
    }
}

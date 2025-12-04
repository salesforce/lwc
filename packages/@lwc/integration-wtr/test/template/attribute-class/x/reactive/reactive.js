import { LightningElement, api, track } from 'lwc';

export default class Reactive extends LightningElement {
    @track dynamicClass = {};

    @api
    updateDynamicClass(updaterFn) {
        updaterFn(this.dynamicClass);
    }
}

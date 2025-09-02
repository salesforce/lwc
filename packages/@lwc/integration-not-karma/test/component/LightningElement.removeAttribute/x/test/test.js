import { LightningElement, api } from 'lwc';

export default class Test extends LightningElement {
    @api
    removeComponentAttribute(...args) {
        return this.removeAttribute(...args);
    }
}

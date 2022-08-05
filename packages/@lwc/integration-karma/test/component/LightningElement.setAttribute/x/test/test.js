import { LightningElement, api } from 'lwc';

export default class Test extends LightningElement {
    @api
    setComponentAttribute(...args) {
        return this.setAttribute(...args);
    }
}

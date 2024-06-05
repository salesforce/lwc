import { LightningElement, api } from 'lwc';

export default class Shadow extends LightningElement {
    @api
    getHostElement() {
        return this.elementSelf;
    }
}

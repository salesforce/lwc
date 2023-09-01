import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api
    version = 0;

    @api
    getRef(name) {
        return this.refs[name];
    }
}

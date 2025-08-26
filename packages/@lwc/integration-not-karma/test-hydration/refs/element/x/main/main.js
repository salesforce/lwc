import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api getRef(name) {
        return this.refs[name];
    }
}

import { LightningElement, api } from 'lwc';

export default class Test extends LightningElement {
    @api isSynthetic() {
        return typeof this.template.synthetic === 'undefined' ? false : this.template.synthetic;
    }
}

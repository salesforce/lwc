import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api
    getAllRefs() {
        return [...this.template.children].map((_) => _.getRef('foo'));
    }
}

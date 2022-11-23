import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api
    linkUsingAriaLabelledBy() {
        const id = this.refs.target.getId();
        this.refs.source.setAriaLabelledBy(id);
    }
}

import { api, LightningElement } from 'lwc';

export default class MoreDetails extends LightningElement {
    @api details = document.createElement('details');
    renderedCallback() {
        this.refs.details.attributeChangedCallback.call(this.details, 'open', '', 'open');
    }
}

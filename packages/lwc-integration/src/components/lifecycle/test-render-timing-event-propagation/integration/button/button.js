import { api, LightningElement } from 'lwc';

export default class IntegrationButton extends LightningElement {
    @api
    hideButton = false;

    @api
    click() {
        this.template.querySelector('button').click();
    }

    @api
    lastClickHandled() {
        if (this.template.querySelector('button') === null) {
            this.dispatchEvent(
                new CustomEvent('bad', { bubbles: true, composed: true })
            );
        }
    }
}

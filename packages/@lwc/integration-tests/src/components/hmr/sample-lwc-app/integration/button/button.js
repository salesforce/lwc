import { LightningElement, api } from 'lwc';

export default class Button extends LightningElement {
    @api
    label;

    click_handler() {
        // eslint-disable-next-line no-console
        console.log('button was clicked');
    }
}

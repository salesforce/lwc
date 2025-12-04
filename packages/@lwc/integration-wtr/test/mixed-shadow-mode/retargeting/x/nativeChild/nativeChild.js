import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    static shadowSupportMode = 'native';

    @api click() {
        this.refs.button.click();
    }
}

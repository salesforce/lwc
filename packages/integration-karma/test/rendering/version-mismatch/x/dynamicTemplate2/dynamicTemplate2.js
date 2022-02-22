import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api template;

    render() {
        return this.template;
    }
}

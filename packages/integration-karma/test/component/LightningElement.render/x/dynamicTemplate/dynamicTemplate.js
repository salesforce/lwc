import { LightningElement, api } from 'lwc';

export default class DynamicTemplate extends LightningElement {
    @api template;

    render() {
        return this.template;
    }
}

import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    static renderMode = 'light';
    @api tmpl;

    render() {
        return this.tmpl;
    }
}

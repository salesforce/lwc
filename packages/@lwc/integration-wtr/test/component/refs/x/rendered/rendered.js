import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api result = 'initial value';

    renderedCallback() {
        this.result = this.refs.foo.textContent;
    }
}

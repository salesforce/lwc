import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    static renderMode = 'light';

    @api getRefTextContent(name) {
        return this.refs[name].textContent;
    }
}

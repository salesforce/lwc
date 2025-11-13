import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api getRefTextContent(name) {
        return this.refs[name].textContent;
    }

    spread = {};
}

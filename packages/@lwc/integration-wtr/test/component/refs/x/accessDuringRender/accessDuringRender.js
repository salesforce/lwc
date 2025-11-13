import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api refsAreDefined;

    @api
    get refTextContent() {
        const { refs } = this;
        if (!refs) {
            return 'refs are undefined';
        }
        return refs.ref.textContent;
    }
}

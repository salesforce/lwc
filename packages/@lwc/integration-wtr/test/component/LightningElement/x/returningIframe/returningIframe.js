import { LightningElement } from 'lwc';

export default class ReturningIframe extends LightningElement {
    constructor() {
        super();
        const iframe = document.createElement('iframe');
        LightningElement.call(iframe);
        return iframe;
    }
}

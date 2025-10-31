import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api
    fooEventCount = 0;

    @api
    version = 0;

    handleFooEvent() {
        this.fooEventCount++;
    }

    @api
    fireFooEvent() {
        this.template.querySelector('div').dispatchEvent(new CustomEvent('foo'));
    }
}

import { LightningElement, api } from 'lwc';

export default class Light extends LightningElement {
    static renderMode = 'light';

    @api
    getHostElement() {
        return this.elementSelf;
    }
}

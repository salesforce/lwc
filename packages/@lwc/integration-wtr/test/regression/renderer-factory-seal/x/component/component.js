import { LightningElement, api, rendererFactory } from 'lwc';

export default class Component extends LightningElement {
    @api
    buildRenderer() {
        return rendererFactory(null);
    }
}

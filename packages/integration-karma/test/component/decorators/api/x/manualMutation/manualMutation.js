import { LightningElement, api } from 'lwc';

export default class ManualMutation extends LightningElement {
    @api
    setPropertyManually(value) {
        this.template.querySelector('x-properties').publicProp = value;
    }

    @api
    setAccessorManually(value) {
        this.template.querySelector('x-getter-setter').publicAccessor = value;
    }
}

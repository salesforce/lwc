import { LightningElement } from 'lwc';

export default class DefaultChild extends LightningElement {
    getShadowMode() {
        return this.template.mode;
    }
}

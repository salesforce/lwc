import { LightningElement } from 'lwc';

export default class OpenChild extends LightningElement {
    static shadowRootMode = 'open';

    getShadowMode() {
        return this.template.mode;
    }
}

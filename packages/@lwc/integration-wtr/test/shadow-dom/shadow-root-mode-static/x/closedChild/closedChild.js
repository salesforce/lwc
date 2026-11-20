import { LightningElement } from 'lwc';

export default class ClosedChild extends LightningElement {
    static shadowRootMode = 'closed';

    getShadowMode() {
        return this.template.mode;
    }
}

import { LightningElement, api } from 'lwc';

export default class FieldForCache extends LightningElement {
    @api label;
    cachedLabel = null;

    get computedLabel() {
        if (this.cachedLabel === null) {
            this.cachedLabel = this.label + ' computed';
        }

        return this.cachedLabel;
    }
}

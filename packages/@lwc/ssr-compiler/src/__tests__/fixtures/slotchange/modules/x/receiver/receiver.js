import { LightningElement } from 'lwc';

export default class extends LightningElement {
    handleSlotChange() {
        throw new Error('should not emit slotchange in SSR');
    }
}

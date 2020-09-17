import { LightningElement, api } from 'lwc';

export default class Container extends LightningElement {
    counter = 0;
    defaultSlotCounter = 0;
    namedSlotCounter = 0;

    @api
    reRenderElementInShadow() {
        this.counter++;
    }

    @api
    updateElementInDefaultSlot() {
        this.defaultSlotCounter++;
    }

    @api
    updateElementInNamedSlot() {
        this.namedSlotCounter++;
    }
}

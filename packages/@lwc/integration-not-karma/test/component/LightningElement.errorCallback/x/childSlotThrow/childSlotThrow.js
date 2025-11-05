import { LightningElement } from 'lwc';

export default class ChildSlotThrow extends LightningElement {
    renderedCallback() {
        throw new Error('Slot thew an error during rendering');
    }
}

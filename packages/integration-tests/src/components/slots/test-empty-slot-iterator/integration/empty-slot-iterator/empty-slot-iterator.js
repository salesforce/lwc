import { LightningElement, api } from 'lwc';

export default class EmptySlotIterator extends LightningElement {
    @api get items() {
        return ['foo', 'bar'];
    }
}

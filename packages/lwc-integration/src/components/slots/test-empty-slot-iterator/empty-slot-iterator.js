import { Element, api } from 'engine';

export default class EmptySlotIterator extends Element {
    @api get items() {
        return ['foo', 'bar'];
    }
}
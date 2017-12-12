import { Element, register } from 'engine';

export default class PierceDispatchEvent extends Element {
    @track eventCount = 0;

    handleCustom(evt) {
        this.eventCount += 1;
    }
}
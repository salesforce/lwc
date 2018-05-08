import { Element, track } from 'engine';

export default class ComposedEvents extends Element {
    @track show = false;
    handleFoo() {
        this.show = true;
    }
}

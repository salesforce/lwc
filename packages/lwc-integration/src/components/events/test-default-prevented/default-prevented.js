import { Element, track } from 'engine';

export default class DefaultPrevented extends Element {
    @track eventSender;

    handleFoo(evt) {
        evt.preventDefault();

        if (evt.defaultPrevented) {
            this.eventSender = evt.detail.name;
        }
    }
}

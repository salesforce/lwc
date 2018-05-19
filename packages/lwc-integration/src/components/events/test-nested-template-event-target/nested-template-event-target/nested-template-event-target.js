import { Element, track } from 'engine';

export default class NestedTemplateEventTarget extends Element {
    @track
    evtTargetIsXChild = false;

    handleFoo(evt) {
        this.evtTargetIsXChild = evt.target.tagName.toLowerCase() === 'x-child';
    }
}

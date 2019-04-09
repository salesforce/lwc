import { LightningElement, api } from 'lwc';

export default class EventHandlingParent extends LightningElement {
    @api
    evtTargetIsXChild = false;

    handleFoo(evt) {
        this.evtTargetIsXChild = evt.target.tagName.toLowerCase() === 'x-event-dispatching-child';
    }
}

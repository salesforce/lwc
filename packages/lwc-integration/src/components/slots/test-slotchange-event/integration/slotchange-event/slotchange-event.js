import { api, track, LightningElement } from 'lwc';

export default class App extends LightningElement {
    @track state = {
        events: [],
    }

    _leakedSlotChangeEvents = [];

    @api
    get leakedSlotChangeEvents() {
        return this._leakedSlotChangeEvents;
    }

    @api
    get events() {
        return this.state.events;
    }

    get messages() {
        return this.state.events.map(
            data => `${data.name}: ${data.elements.join(' ')}`
        );
    }

    handleMessage(event) {
        const { name, elements } = event.detail;
        this.state.events.push({
            name,
            elements,
        });
    }

    handleLeakedSlotChange(event) {
        this._leakedSlotChangeEvents.push(event);
    }
}

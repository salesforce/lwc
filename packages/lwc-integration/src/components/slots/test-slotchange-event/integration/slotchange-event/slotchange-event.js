import { api, track, LightningElement } from 'lwc';

export default class App extends LightningElement {
    @track state = {
        events: [],
        things: ['foo'],
        toggle: false,
    }

    @api
    addEventListenerToSlot() {
        const child = this.template.querySelector('integration-child');
        child.addEventListenerToSlot();
    }

    @api
    toggle() {
        this.state.toggle = !this.state.toggle;
    }

    @api
    get leakedSlotChangeEvents() {
        return this._leakedSlotChangeEvents;
    }
    _leakedSlotChangeEvents = [];

    @api
    get events() {
        return this.state.events;
    }

    get things() {
        return this.state.things;
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

    handleClickClear() {
        this.state.things = [];
    }
    handleClickFoo() {
        this.state.things = ['foo'];
    }
    handleClickFooBar() {
        this.state.things = ['foo', 'bar'];
    }
    handleClickCountries() {
        this.state.things = ['belarus', 'china', 'cuba', 'france', 'india', 'japan', 'spain'];
    }

    handleClickAddSlotChange() {
        this.addEventListenerToSlot();
    }
    handleClickToggle() {
        this.toggle();
    }
}

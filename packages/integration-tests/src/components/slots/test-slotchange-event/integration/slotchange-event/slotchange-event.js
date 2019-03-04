import { track, LightningElement } from 'lwc';

export default class SlotChangeEvent extends LightningElement {
    @track state = {
        events: [],
        leakedEvents: [],
        things: ['foo'],
        toggle: false,
        updateName: false,
    };

    get leakedSlotChangeEventCount() {
        return this.state.leakedEvents.length;
    }

    get things() {
        return this.state.things;
    }

    get messages() {
        return this.state.events.map(data => JSON.stringify(data));
    }

    addEventListenerToSlot() {
        const child = this.template.querySelector('integration-child');
        child.addEventListenerToSlot();
    }

    toggle() {
        this.state.toggle = !this.state.toggle;
    }

    handleMessage(event) {
        const { slotName, assignedContents } = event.detail;
        this.state.events.push({
            slotName,
            assignedContents,
        });
    }

    handleLeakedSlotChange(event) {
        this.state.leakedEvents.push(event);
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

    handleClickUpdateName() {
        this.state.updateName = true;
    }
}

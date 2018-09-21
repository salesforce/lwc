import { api, track, LightningElement } from 'lwc';

export default class App extends LightningElement {
    @track
    state = {
        assignSlotable: false,
        things: ['foo'],
    }

    @api
    get things() {
        return this.state.things;
    }
    set things(value) {
        this.state.things = value;
    }

    @api
    addEventListenerToSlot() {
        const child = this.template.querySelector('integration-child');
        child.addEventListenerToSlot();
    }

    @api
    toggleAssignedElement() {
        this.state.assignSlotable = !this.state.assignSlotable;
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
    handleClickAssign() {
        this.toggleAssignedElement();
    }
}

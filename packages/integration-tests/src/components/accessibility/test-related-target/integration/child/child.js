import { LightningElement, api, track } from 'lwc';

export default class Child extends LightningElement {
    @track
    events = [];

    @api
    getEvents() {
        return this.events;
    }

    handleFocusOrBlur(event) {
        const { type, relatedTarget } = event;
        const component = 'child';
        this.events.push({
            component,
            type,
            relatedTarget: relatedTarget ? relatedTarget.tagName : 'NULL',
        });
    }

    get formattedEvents() {
        return this.events.map(JSON.stringify);
    }
}

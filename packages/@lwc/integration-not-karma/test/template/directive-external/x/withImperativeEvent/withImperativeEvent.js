import { LightningElement } from 'lwc';

export default class WithImperativeEvent extends LightningElement {
    eventHandled = false;

    renderedCallback() {
        this.template
            .querySelector('ce-with-event')
            .addEventListener('camelEvent', this.handleTestEvent.bind(this));
    }

    handleTestEvent() {
        this.eventHandled = true;
    }
}

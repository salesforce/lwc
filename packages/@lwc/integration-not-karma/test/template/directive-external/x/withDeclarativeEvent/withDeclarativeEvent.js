import { LightningElement } from 'lwc';

export default class WithDeclarativeEvent extends LightningElement {
    eventHandled = false;

    handleTestEvent() {
        this.eventHandled = true;
    }
}

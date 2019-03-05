import { LightningElement, track } from 'lwc';

export default class Child extends LightningElement {
    @track defaultPrevented = false;

    handleClick() {
        const event = new CustomEvent('foo', {
            cancelable: true,
        });
        this.dispatchEvent(event);
        this.defaultPrevented = event.defaultPrevented;
    }
}

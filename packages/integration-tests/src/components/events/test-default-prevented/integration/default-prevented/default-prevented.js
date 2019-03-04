import { LightningElement } from 'lwc';

export default class DefaultPrevented extends LightningElement {
    handleFoo(evt) {
        evt.preventDefault();
    }
}

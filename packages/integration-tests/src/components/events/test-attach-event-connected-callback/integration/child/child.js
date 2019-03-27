import { LightningElement } from 'lwc';

export default class Child extends LightningElement {
    handleClick() {
        const e = new CustomEvent('cstm', { bubbles: true, composed: true });
        this.dispatchEvent(e);
    }
}

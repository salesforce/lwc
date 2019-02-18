import { LightningElement } from 'lwc';

export default class Child extends LightningElement {
    handleClick() {
        let e = new CustomEvent('cstm', { bubbles: true, composed: true });
        this.dispatchEvent(e);
    }
}

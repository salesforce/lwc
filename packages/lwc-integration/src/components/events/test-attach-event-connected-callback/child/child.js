import { Element } from 'engine';

export default class Child extends Element {

    handleClick() {
        let e = new CustomEvent('cstm', {bubbles: true, composed: true});
        this.dispatchEvent(e);
    }
}

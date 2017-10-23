import { Element } from 'engine';

export default class Child extends Element {

    handleClick() {
        let e = new CustomEvent('cstm', {bubbles: true});
        this.dispatchEvent(e);
    }
}
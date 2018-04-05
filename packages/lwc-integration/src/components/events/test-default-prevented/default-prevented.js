import { Element } from 'engine';

export default class DefaultPrevented extends Element {
    handleFoo(evt) {
        evt.preventDefault();
    }
}

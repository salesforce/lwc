import { Element, track } from "engine";

export default class EmptyClassname extends Element {
    @track computedClassName = 'foo';

    handleClick() {
        this.computedClassName = '';
    }
}
import { Element, track } from 'engine';

export default class NestedRenderConditional extends Element {
    @track toggle = true;

    handleClick() {
        this.toggle = !this.toggle;
    }

    @track nevertrue = false;
}

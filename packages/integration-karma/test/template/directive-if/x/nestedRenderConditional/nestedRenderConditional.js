import { LightningElement, track } from 'lwc';

export default class NestedRenderConditional extends LightningElement {
    @track toggle = true;

    handleClick() {
        this.toggle = !this.toggle;
    }

    @track nevertrue = false;
}

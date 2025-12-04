import { LightningElement } from 'lwc';
import Slottable from 'x/slottable';

export default class extends LightningElement {
    ctor;

    connectedCallback() {
        this.ctor = Slottable;
    }
}

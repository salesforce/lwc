import { LightningElement } from 'lwc';
import Slottable from 'c/slottable';

export default class extends LightningElement {
    ctor;

    connectedCallback() {
        this.ctor = Slottable;
    }
}

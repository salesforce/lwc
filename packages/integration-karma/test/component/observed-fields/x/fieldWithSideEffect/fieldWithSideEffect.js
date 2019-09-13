import { LightningElement, api } from 'lwc';
import tpl from './fieldWithSideEffect.html';

export default class FieldWithSideEffect extends LightningElement {
    @api label;
    @api useExpando = false;
    counter = 0;

    constructor() {
        super();
        this.expandoCounter = 0;
    }

    render() {
        if (this.useExpando) {
            this.expandoCounter++;
        } else {
            this.counter++;
        }

        return tpl;
    }
}

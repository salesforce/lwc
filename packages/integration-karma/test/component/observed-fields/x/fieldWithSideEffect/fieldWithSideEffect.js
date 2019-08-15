import { LightningElement } from 'lwc';
import tpl from './fieldWithSideEffect.html';

export default class FieldWithSideEffect extends LightningElement {
    counter = 0;

    render() {
        this.counter++;

        return tpl;
    }
}

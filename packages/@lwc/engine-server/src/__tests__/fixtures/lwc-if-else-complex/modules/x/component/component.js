import { LightningElement } from 'lwc';

export default class IfBlock extends LightningElement {
    isTrue() {
        return true;
    }

    isFalse() {
        return this.false;
    }
}

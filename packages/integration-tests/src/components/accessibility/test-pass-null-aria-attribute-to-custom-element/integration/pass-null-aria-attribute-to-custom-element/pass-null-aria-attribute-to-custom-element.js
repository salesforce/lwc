import { LightningElement } from 'lwc';

export default class PassingNullAriaAttribute extends LightningElement {
    get getComputedLabel() {
        return null;
    }
}

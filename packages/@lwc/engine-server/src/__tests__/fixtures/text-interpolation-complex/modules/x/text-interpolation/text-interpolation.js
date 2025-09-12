import { LightningElement } from 'lwc';

export default class TextInterpolation extends LightningElement {
    privateProp = 1;
    functionCall() {
        this.privateProp++;
    }
}

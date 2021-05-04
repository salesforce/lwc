import { LightningElement } from 'lwc';

export default class DynamicChildren extends LightningElement {
    static shadow = false;
    numbers = [1, 2, 3, 4, 5];
}

import { LightningElement } from 'lwc';

export default class DynamicChildren extends LightningElement {
    static renderMode = 'light';
    numbers = [1, 2, 3, 4, 5];

    reverse() {
        this.numbers = [...this.numbers.reverse()];
    }
}

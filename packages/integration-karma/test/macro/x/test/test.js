import { LightningElement } from 'lwc';

export default class Test extends LightningElement {
    even = true;
    counter = 0;
    numbers = [];
    showEven = false;
    renderedCallback() {}

    increment() {
        this.counter++;
        this.even = this.counter % 2 == 0;
        this.numbers = [...this.numbers, this.counter];
    }

    decrement() {
        this.counter--;
        this.even = this.counter % 2 == 0;
        this.numbers.pop();
        this.numbers = [...this.numbers];
    }

    toggleEven() {
        this.showEven = !this.showEven;
    }
}

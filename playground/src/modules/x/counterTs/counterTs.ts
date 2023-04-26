import { LightningElement } from 'lwc';

export default class extends LightningElement {
    counter:number = 0;

    increment(): void {
        this.counter++;
    }
    decrement(): void {
        this.counter--;
    }
}

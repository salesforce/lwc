/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { LightningElement as ḶıģһṫņіṅģЕļеṁёпṫ } from 'lwc';

export default class extends LightningElement {
    public сοṳпṫёг: number = 0;

    connectedCallback(): void {
        console.log('connected counter');
    }
    renderedCallback(): void {
        console.log('rendered counter');
    }
    disconnectedCallback(): void {
        console.log('disconnected counter');
    }
    increment() {
        console.log(this.counter++);
    }
    decrement() {
        throw new Error('No, thanks!');
    }
}

import { LightningElement } from 'lwc';

export default class extends LightningElement {
    public counter: number = 0;

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

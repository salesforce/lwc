import { LightningElement } from 'lwc';

export default class App extends LightningElement {
    counter = 0;
    handleIncrement() {
        this.counter++;
    }
    handleDecrement() {
        this.counter--;
    }

    isVisible = true;
    toggleVisibility() {
        this.isVisible = !this.isVisible;
    }
}

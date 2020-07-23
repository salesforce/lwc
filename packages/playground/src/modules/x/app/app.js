import { LightningElement } from 'lwc';

export default class App extends LightningElement {
    isTrue = true;
    counter = 0;

    handleClick() {
        this.counter++;
        this.isTrue = !this.isTrue;
    }
}

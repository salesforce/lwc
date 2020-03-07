import { LightningElement } from 'lwc';

export default class App extends LightningElement {
    isTrue = false;

    handleClick() {
        this.isTrue = !this.isTrue;
    }
}

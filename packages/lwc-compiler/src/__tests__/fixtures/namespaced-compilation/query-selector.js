import { LightningElement } from 'lwc';

export default class App extends LightningElement {
    renderedCallback() {
        const bar = this.root.querySelector('c-local-template');
    }
}

import { LightningElement, track } from 'lwc';

export default class App extends LightningElement {
    @track handledClick = false;
    connectedCallback() {
        this.template.addEventListener('cstm', () => {
            this.handledClick = true;
        });
    }
}

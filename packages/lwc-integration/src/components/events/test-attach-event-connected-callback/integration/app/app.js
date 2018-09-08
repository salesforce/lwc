import { LightningElement, track } from "lwc";

export default class App extends LightningElement {
    @track handledClick = false;
    connectedCallback(){
        this.root.addEventListener('cstm', () => {
            this.handledClick = true;
        });
    }
}

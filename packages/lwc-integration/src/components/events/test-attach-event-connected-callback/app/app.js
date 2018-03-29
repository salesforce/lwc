import { Element, track } from 'engine';

export default class App extends Element {
    @track handledClick = false;
    connectedCallback(){
        this.root.addEventListener('cstm', () => {
            this.handledClick = true;
        });
    }
}

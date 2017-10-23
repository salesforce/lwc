import { Element } from 'engine';

export default class App extends Element {
    state = {
        handledClick: false
    };
    connectedCallback(){
        this.addEventListener('cstm', () => {
            this.state.handledClick = true;
        });
    }
}
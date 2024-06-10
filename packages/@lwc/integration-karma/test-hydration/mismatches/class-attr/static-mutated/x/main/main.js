import { LightningElement } from 'lwc';

export default class Main extends LightningElement {
    renderedCallback() {
        this.refs.p.classList.add('hahaha!');
    }
}

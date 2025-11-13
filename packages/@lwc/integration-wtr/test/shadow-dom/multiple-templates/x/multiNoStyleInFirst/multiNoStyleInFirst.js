import { LightningElement, api } from 'lwc';
import A from './a.html';
import B from './b.html';

export default class MultiNoStyleInFirst extends LightningElement {
    current = A;

    @api
    next() {
        this.current = this.current === A ? B : A;
    }

    render() {
        return this.current;
    }

    renderedCallback() {
        this.template.querySelector('.manual').innerHTML = '<div class="green">manual</div>';
    }
}

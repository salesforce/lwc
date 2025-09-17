import { LightningElement, api } from 'lwc';
import A from './a.html';
import B from './b.html';

export default class MultiNoStyleInFirst extends LightningElement {
    static renderMode = 'light';
    current = A;

    @api
    next() {
        this.current = this.current === A ? B : A;
    }

    render() {
        return this.current;
    }
}

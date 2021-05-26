import { LightningElement, api } from 'lwc';
import A from './a.html';
import B from './b.html';

export default class Multi extends LightningElement {
    static shadow = false;
    current = A;

    @api
    next() {
        this.current = this.current === A ? B : A;
    }

    render() {
        return this.current;
    }
}

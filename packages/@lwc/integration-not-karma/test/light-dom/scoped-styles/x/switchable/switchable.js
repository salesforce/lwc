import { LightningElement, api } from 'lwc';
import A from './a.html';
import B from './b.html';
import C from './c.html';
import D from './d.html';

const templates = [A, B, C, D];

export default class Switchable extends LightningElement {
    static renderMode = 'light';
    current = 0;

    @api
    next() {
        this.current++;
    }

    render() {
        return templates[this.current];
    }
}

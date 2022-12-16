import { LightningElement, api } from 'lwc';
import stylesheet from './stylesheet.css';
import a from './a.html';
import b from './b.html';

export default class extends LightningElement {
    static stylesheets = [stylesheet];

    _showA = true;

    @api
    next() {
        this._showA = !this._showA;
    }

    render() {
        return this._showA ? a : b;
    }
}

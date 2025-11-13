import { LightningElement } from 'lwc';
import a from './a.css';
import b from './b.css';

export default class extends LightningElement {
    static stylesheets = [a, b];
}

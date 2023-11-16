import { LightningElement } from 'lwc';
import a from './a.scoped.css';
import b from './b.css';

export default class extends LightningElement {
    static renderMode = 'light';
    static stylesheets = [a, b];
}

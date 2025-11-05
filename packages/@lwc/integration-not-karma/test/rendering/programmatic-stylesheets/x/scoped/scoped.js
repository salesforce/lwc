import { LightningElement } from 'lwc';
import stylesheet from './stylesheet.scoped.css';

export default class extends LightningElement {
    static stylesheets = [stylesheet];
    static renderMode = 'light';
}

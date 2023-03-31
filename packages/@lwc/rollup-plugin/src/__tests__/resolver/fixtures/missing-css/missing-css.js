import { LightningElement } from 'lwc';
import stylesheet from './stylesheet.css';

export default class MissingCss extends LightningElement {
    static stylesheets = [stylesheet];
}
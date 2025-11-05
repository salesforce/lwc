import { LightningElement } from 'lwc';
import stylesheet from './stylesheet.css';

export default class StylesheetsMutation extends LightningElement {
    static stylesheets = [stylesheet];

    connectedCallback() {
        StylesheetsMutation.stylesheets = [stylesheet];
    }
}

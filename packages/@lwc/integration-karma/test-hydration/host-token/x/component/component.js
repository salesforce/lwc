import { LightningElement } from 'lwc';
import style from './component.scoped.css';
import html from './template.html';

export default class extends LightningElement {
    static renderMode = 'light';
    static stylesheets = [style];

    render() {
        return html;
    }
}

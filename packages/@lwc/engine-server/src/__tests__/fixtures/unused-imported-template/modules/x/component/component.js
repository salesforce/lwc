import { LightningElement } from 'lwc';
import tmpl from './component.html';

export default class HelloWorld extends LightningElement {
    static renderMode = 'light';
    // Used so it doesn't get stripped from the bundle, but not used for rendering the component
    template = tmpl;
}

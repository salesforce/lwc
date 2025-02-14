import { LightningElement } from 'lwc';
import cmp from './component.html';
cmp.stylesheetToken = 'stylesheet.token';

export default class HelloWorld extends LightningElement {
    static renderMode = 'light';
}

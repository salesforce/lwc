import { LightningElement } from 'lwc';
import template from './tabIndexSetInRender.html';

export default class MyComponent extends LightningElement {
    render() {
        this.tabIndex = 2;
        return template;
    }
}

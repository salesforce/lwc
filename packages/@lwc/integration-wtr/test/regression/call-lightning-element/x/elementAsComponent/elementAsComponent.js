import { LightningElement } from 'lwc';

export default class ElementAsComponent extends LightningElement {
    constructor() {
        super();
        const div = document.createElement('div');
        Reflect.apply(LightningElement, div, []);
        return div;
    }
}

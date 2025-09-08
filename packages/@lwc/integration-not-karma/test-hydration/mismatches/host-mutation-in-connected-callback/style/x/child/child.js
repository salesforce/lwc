import { LightningElement } from 'lwc';

export default class Child extends LightningElement {
    yolo = 'woot';

    connectedCallback() {
        this.setAttribute('style', 'color: blue;');
    }
}

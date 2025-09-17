import { LightningElement } from 'lwc';

export default class Child extends LightningElement {
    yolo = 'woot';

    connectedCallback() {
        this.setAttribute('data-mutatis', 'mutandis');
    }
}

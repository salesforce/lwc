import { LightningElement } from 'lwc';

export default class Child extends LightningElement {
    yolo = 'woot';

    connectedCallback() {
        this.classList.add('mutatis');
        this.classList.add('mutandis');
        this.classList.remove('mutandis');
    }
}

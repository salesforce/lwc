import { LightningElement } from 'lwc';

export default class extends LightningElement {
    renderedCallback() {
        this.template.querySelector('p').classList.add('hahaha!');
    }
}

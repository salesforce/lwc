import { LightningElement } from "lwc";


export default class LightdomQuerySelector extends LightningElement {
    connectedCallback() {
        this.addEventListener('click', () => {
            this.template.querySelector('x-parent').querySelector('span').setAttribute('data-selected', 'true');
        });
    }
}

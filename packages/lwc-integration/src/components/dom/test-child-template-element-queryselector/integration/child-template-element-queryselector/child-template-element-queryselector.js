import { LightningElement } from "lwc";


export default class LightdomQuerySelector extends LightningElement {
    connectedCallback() {
        this.addEventListener('click', () => {
            this.template.querySelector('integration-parent').querySelector('span').setAttribute('data-selected', 'true');
        });
    }
}

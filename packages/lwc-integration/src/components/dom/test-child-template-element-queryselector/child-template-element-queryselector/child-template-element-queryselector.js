import { Element } from 'engine';


export default class LightdomQuerySelector extends Element {
    connectedCallback() {
        this.addEventListener('click', () => {
            this.template.querySelector('x-parent').querySelector('div').setAttribute('data-selected', 'true');
        });
    }
}

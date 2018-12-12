import { LightningElement } from 'lwc';

export default class DomModeManualSvg extends LightningElement {
    rendered = false
    renderedCallback() {
        if (this.rendered === false) {
            this.rendered = true;
            const elm = document.createElement('g');
            this.template.querySelector('svg').appendChild(elm);
        }
    }
}

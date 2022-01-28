import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    renderedCallback() {
        this.template.querySelector('div').innerHTML = '<div class="manual">manual</div>';
    }

    @api
    getManualNode() {
        return this.template.querySelector('.manual');
    }

    @api
    insertManualNode(node) {
        const div = this.template.querySelector('div');
        div.innerHTML = ''; // clear
        div.appendChild(node);
    }
}

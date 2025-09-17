import { LightningElement } from 'lwc';

export default class extends LightningElement {
    value = {
        id: 'parentProvided',
        draggable: true,
        spellcheck: true,
        tabindex: 0,
        hidden: true,
    };
}

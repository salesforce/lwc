import { LightningElement } from 'lwc';

export default class extends LightningElement {
    // None of these values should be set (parent takes precedence)
    id = 'childValue';
    draggable = false;
    hidden = false;
    spellcheck = false;
    tabindex = -1;
}

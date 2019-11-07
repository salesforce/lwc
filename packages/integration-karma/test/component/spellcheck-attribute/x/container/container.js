import { LightningElement, api } from 'lwc';

export default class Container extends LightningElement {
    @api spellcheckValue;

    get computedSpellcheck() {
        return this.spellcheckValue;
    }
}

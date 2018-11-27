import { LightningElement, api } from 'lwc';

export default class TableComponentRow extends LightningElement {
    @api row;

    handleSelect() {
        this.dispatchEvent(new CustomEvent('select'));
    }

    handleRemove() {
        this.dispatchEvent(new CustomEvent('remove'));
    }
}

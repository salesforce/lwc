import { Element } from 'engine';

export default class TableComponentRow extends Element {
    @api row;

    handleSelect() {
        this.dispatchEvent(new CustomEvent('select'));
    }

    handleRemove() {
        this.dispatchEvent(new CustomEvent('remove'));
    }
}

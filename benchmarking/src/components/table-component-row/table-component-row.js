import { Element } from 'raptor-engine';

export default class TableComponentRow extends Element {
    row;

    handleSelect() {
        this.dispatchEvent(new CustomEvent('select'));
    }

    handleRemove() {
        this.dispatchEvent(new CustomEvent('remove'));
    }
}

import { HTMLElement } from 'raptor-engine';

export default class TableComponentRow extends HTMLElement {
    row;

    handleSelect() {
        this.dispatchEvent(new CustomEvent('select'));
    }

    handleRemove() {
        this.dispatchEvent(new CustomEvent('remove'));
    }
}

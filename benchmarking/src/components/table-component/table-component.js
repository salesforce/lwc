import { Element } from 'raptor-engine';

export default class TableComponent extends Element {
    rows = [];

    handleSelect() {
        console.log('[handler] selected');
    }

    handleRemove() {
        console.log('[handler] removed');
    }
}

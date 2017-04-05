import { Element } from 'raptor-engine';

export default class Table extends Element {
    rows = [];

    handleSelect() {
        console.log('[handler] selected');
    }

    handleRemove() {
        console.log('[handler] removed');
    }
}

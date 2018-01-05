import { Element, api } from 'engine';

export default class Table extends Element {
    @api rows = [];

    handleSelect() {
        console.log('[handler] selected');
    }

    handleRemove() {
        console.log('[handler] removed');
    }
}

import { Element, api } from 'engine';

export default class TableComponent extends Element {
    @api rows = [];

    handleSelect() {
        console.log('[handler] selected');
    }

    handleRemove() {
        console.log('[handler] removed');
    }
}

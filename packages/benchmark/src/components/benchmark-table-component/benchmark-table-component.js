import { LightningElement, api } from 'lwc';

export default class TableComponent extends LightningElement {
    @api rows = [];

    handleSelect() {
        console.log('[handler] selected');
    }

    handleRemove() {
        console.log('[handler] removed');
    }
}

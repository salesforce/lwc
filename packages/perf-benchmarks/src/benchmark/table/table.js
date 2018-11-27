import { LightningElement, api } from 'lwc';

export default class Table extends LightningElement {
    @api rows = [];

    handleSelect() {
        console.log('[handler] selected');
    }

    handleRemove() {
        console.log('[handler] removed');
    }
}

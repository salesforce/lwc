import { LightningElement, track, api } from 'lwc';

export default class extends LightningElement {
    @api
    reactivityTestCaseEnabled = false;

    @api
    callbacksTestCaseEnabled = false;

    @track
    items = [
        { id: 39, name: 'Audio' },
        { id: 40, name: 'Video' },
    ];

    @api
    changeItemsNestedKey() {
        this.items[0].id = '38';
    }

    @api
    changeItemsNestedValue() {
        this.items[0].name = 'Light';
    }

    @api
    changeItemsRow() {
        this.items[0] = { id: '37', name: 'Tape' };
    }

    renderedCallback() {
        window.timingBuffer.push('parent:renderedCallback');
    }
}

import { LightningElement, track, api } from 'lwc';

export default class extends LightningElement {
    @track
    items = [
        { id: 39, name: 'Audio' },
        { id: 40, name: 'Video' },
    ];

    @api
    changeItemsNestedValue() {
        this.items[0].id = '38';
    }

    @api
    changeItemsRow() {
        this.items[0] = { id: '37', name: 'Tape' };
    }

    renderedCallback() {
        window.timingBuffer.push('parent:renderedCallback');
    }
}

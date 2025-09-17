import { LightningElement, api, track } from 'lwc';

export default class extends LightningElement {
    static renderMode = 'light';
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
    changeItemsRow() {
        this.items[0] = { id: '37', name: 'Tape' };
    }

    renderedCallback() {
        window.timingBuffer.push('child:renderedCallback');
    }
}

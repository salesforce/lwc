import { LightningElement, track } from 'lwc';

export default class extends LightningElement {
    @track
    data = [
        {
            number: 1,
            data: [
                { id: 'col1', number: 1 },
                { id: 'col2', number: 2 },
            ],
        },
        { number: 2, data: [{ id: 'col1', number: 1 }] },
        {
            number: 3,
            data: [
                { id: 'col1', number: 1 },
                { id: 'col2', number: 2 },
                { id: 'col3', number: 3 },
            ],
        },
        { number: 4, data: [{ id: 'col1', number: 1 }] },
    ];
}

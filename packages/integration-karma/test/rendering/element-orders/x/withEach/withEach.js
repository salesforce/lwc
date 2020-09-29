import { LightningElement, api } from 'lwc';

export default class WithEach extends LightningElement {
    elements = [
        {
            key: 1,
            show: false,
        },
        {
            key: 2,
            show: true,
        },
        {
            key: 3,
            show: false,
        },
        {
            key: 4,
            show: false,
        },
        {
            key: 5,
            show: true,
        },
    ];

    @api
    triggerDiffingAlgo() {
        const modifiedElements = Array.from(this.elements);

        modifiedElements[0].show = true;
        modifiedElements[2].show = true;

        this.elements = modifiedElements;
    }
}

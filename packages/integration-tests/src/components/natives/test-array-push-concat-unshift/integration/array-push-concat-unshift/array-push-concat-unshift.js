import { LightningElement, api, track } from 'lwc';

export default class Issue763 extends LightningElement {
    @api propItems = [
        {
            title: 'first',
        },
        {
            title: 'second',
        },
    ];

    @track items = [
        {
            title: 'first',
        },
        {
            title: 'second',
        },
    ];

    @track pushItems = [
        {
            title: 'first',
        },
        {
            title: 'second',
        },
    ];

    @track concatItems = [
        {
            title: 'first',
        },
        {
            title: 'second',
        },
    ];

    @track propConcatItem = [
        {
            title: 'first',
        },
        {
            title: 'second',
        },
    ];

    handleClick() {
        this.items.unshift({
            title: 'unshifted',
        });
    }

    handlePushClick() {
        this.pushItems.push({
            title: 'pushed',
        });
    }

    handleConcatClick() {
        this.concatItems = this.concatItems.concat([
            {
                title: 'concat 1',
            },
            {
                title: 'concat 2',
            },
        ]);
    }

    handlePropConcatClick() {
        this.propConcatItem = [
            {
                title: 'concat 1',
            },
            {
                title: 'concat 2',
            },
        ].concat(this.propItems);
    }
}

import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api
    linkElements({ reverseOrder = false } = {}) {
        const id = 'my-id';

        const operations = [
            () => {
                this.refs.input.setAttribute('aria-labelledby', id);
            },
            () => {
                this.refs.label.setAttribute('id', id);
            },
        ];

        if (reverseOrder) {
            operations.reverse();
        }

        for (const operation of operations) {
            operation();
        }
    }
}

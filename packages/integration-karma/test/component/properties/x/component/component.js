import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api
    getEnumerableProps() {
        const props = [];
        for (const prop in this) {
            props.push(prop);
        }
        return props.sort();
    }
}

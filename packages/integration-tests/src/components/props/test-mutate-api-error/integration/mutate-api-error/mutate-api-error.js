import { LightningElement } from 'lwc';

export default class MutateApiError extends LightningElement {
    get getFoo() {
        return {
            x: 1,
        };
    }
}

import { Element } from 'engine';

export default class MutateApiError extends Element {
    get getFoo() {
        return {
            x: 1
        };
    }
}
import { Element } from 'engine';

export default class ChildConstructorThrow extends Element {
    constructor() {
        super();
        throw new Error('child-constructor-throw: triggered error');
    }
}

import { LightningElement } from 'lwc';

export default class RenderArrayNullPrototype extends LightningElement {
    get items() {
        const first = Object.create(null);
        first.id = 'id';
        first.text = 'text';
        return [first];
    }
}

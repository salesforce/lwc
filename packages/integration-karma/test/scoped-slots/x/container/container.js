import { LightningElement } from 'lwc';

export default class Container extends LightningElement {
    name = 'Container';
    items = [
        { id: 1, name: 'LWC' },
        { id: 2, name: 'Lit' },
    ];
}

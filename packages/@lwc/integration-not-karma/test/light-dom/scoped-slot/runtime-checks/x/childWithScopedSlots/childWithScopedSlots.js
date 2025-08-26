import { LightningElement } from 'lwc';

export default class ChildWithScopedSlots extends LightningElement {
    static renderMode = 'light';
    item = 'child with scoped slot';
}

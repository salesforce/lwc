import { LightningElement } from 'lwc';

export default class EmptyObject extends LightningElement {
    slotName = Object.create(null);
}

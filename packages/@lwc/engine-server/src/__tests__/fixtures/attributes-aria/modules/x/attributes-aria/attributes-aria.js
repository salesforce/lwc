import { LightningElement } from 'lwc';

export default class AttributesAria extends LightningElement {
    computed = {
        id: 'computed-label-id',
        role: 'progressbar',
        valueMin: 0,
        valueMax: 100,
        valueNow: 20,
    }
}
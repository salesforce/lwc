import { LightningElement } from 'lwc';

export default class AriaAttributes extends LightningElement {
    computed = {
        id: 'computed-label-id',
        role: 'progressbar',
        valueMin: 0,
        valueMax: 100,
        valueNow: 20,
    }
}
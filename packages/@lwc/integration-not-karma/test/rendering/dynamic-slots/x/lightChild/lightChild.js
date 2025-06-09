import { LightningElement } from 'lwc';
export default class LightChild extends LightningElement {
    static renderMode = 'light';
    scopedData = { name: 'lwc' };
}

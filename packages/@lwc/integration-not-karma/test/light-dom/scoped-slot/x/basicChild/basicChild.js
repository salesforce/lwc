import { LightningElement } from 'lwc';

export default class Child extends LightningElement {
    static renderMode = 'light';
    item = { id: 1234, name: 'Test' };
}

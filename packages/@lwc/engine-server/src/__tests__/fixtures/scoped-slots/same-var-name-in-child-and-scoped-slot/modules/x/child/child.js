import { LightningElement } from 'lwc';

export default class Child extends LightningElement {
    static renderMode = 'light';
    data = { id: 'from-child' };
    bound = { id: 'prop' };
}

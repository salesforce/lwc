import { LightningElement } from 'lwc';

export default class Child extends LightningElement {
    static renderMode = 'light';
    item = { id: 'default', name: 'Fallback Content' };
}

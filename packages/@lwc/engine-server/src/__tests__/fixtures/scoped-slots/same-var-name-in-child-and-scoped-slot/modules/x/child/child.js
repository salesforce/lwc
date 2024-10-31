import { LightningElement, api } from 'lwc';

export default class Child extends LightningElement {
    static renderMode = 'light';
    data = { id: 'do-not-use-me' }
    bound = { id: 'prop' }
}

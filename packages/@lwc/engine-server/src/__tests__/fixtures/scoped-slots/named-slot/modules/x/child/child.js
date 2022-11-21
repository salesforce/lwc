import { LightningElement } from 'lwc';

export default class Child extends LightningElement {
    static renderMode = 'light';
    item = {id: 99, name: 'ssr'}
}

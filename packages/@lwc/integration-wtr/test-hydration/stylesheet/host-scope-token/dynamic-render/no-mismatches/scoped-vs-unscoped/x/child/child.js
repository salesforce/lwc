import { LightningElement, api } from 'lwc';
import stylish from './stylish.html';
import plain from './plain.html';

export default class Child extends LightningElement {
    @api stylish;
    render() {
        return this.stylish ? stylish : plain;
    }
}

import { LightningElement, api } from 'lwc';

export default class IfBlock extends LightningElement {
    isTrue = true;
    isFalse = false;
    isTruthy = 'truthy value';
    isFalsey = null;
}

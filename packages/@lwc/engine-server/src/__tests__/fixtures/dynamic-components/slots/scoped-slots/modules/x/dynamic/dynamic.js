import { LightningElement, track } from 'lwc';
import Test from 'x/test';

export default class DynamicCtor extends LightningElement {
    @track customCtor = Test;
}
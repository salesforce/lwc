import { LightningElement, track } from 'lwc';
import Test from 'x/static';

export default class DynamicCtor extends LightningElement {
    @track customCtor = Test;
}

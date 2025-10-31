import { LightningElement } from 'lwc';

export default class Child extends LightningElement {
    get dynamicText() {
        return 'text';
    }
}

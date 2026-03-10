import { LightningElement } from 'lwc';
export default class Test extends LightningElement {
    *#generate() {
        yield 1;
        yield 2;
    }
}

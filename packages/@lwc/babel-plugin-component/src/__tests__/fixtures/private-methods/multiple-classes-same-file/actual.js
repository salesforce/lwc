import { LightningElement } from 'lwc';
export default class First extends LightningElement {
    #shared() { return 'first'; }
}
class Second extends LightningElement {
    #shared() { return 'second'; }
}

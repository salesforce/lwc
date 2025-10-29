import { LightningElement, api } from 'lwc';
import Child from 'c/child';

export default class Main extends LightningElement {
    @api label;
    Ctor = Child;
}

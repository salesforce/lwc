import { LightningElement, api } from 'lwc';
import Child from 'x/child';

export default class Main extends LightningElement {
    @api label;
    Ctor = Child;
}

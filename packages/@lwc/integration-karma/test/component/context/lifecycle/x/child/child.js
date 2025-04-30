import { LightningElement, api } from 'lwc';
import childContextFactory from 'x/childContext';

export default class Child extends LightningElement {
    @api context = childContextFactory(); 
}
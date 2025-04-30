import { LightningElement, api } from 'lwc';
import { defineContext } from 'test-state';
import childContextFactory from 'x/childContext';

export default class Grandchild extends LightningElement {
    @api context = defineContext(childContextFactory)(); 
}
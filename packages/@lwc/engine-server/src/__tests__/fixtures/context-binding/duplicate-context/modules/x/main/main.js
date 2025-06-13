import { LightningElement } from 'lwc';
import { defineContext } from 'x/contextManager';
const contextFactory = defineContext();
export default class Main extends LightningElement {
    contextOne = contextFactory('context one');
    contextTwo = contextFactory('context two');
}

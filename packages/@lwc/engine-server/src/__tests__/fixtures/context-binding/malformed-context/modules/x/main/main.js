import { LightningElement } from 'lwc';
import { defineMalformedContext } from 'x/contextManager';
export default class Root extends LightningElement {
    malformedContext = defineMalformedContext()();
}

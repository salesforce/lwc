import { LightningElement } from 'lwc';

export default class AttributeLiveBindings extends LightningElement {
    checked = true;
    unchecked = false;
    nullValue = null;
    undefinedValue = null;
    stringValue = 'test';
}
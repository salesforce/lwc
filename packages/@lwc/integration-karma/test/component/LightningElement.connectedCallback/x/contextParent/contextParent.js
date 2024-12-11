import { LightningElement } from 'lwc';
import { nameStateFactory } from 'test-state';

export default class ContextParent extends LightningElement {
    random = nameStateFactory();
}

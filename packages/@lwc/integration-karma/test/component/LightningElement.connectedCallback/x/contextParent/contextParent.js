import { LightningElement } from 'lwc';
import { nameStateFactory } from 'x/state';

export default class ContextParent extends LightningElement {
    random = nameStateFactory();
}

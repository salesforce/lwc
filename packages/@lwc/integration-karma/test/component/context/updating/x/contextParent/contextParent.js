import { LightningElement, api } from 'lwc';
import { nameStateFactory } from 'x/stateManager';

export default class ContextParent extends LightningElement {
    @api state = nameStateFactory();
}
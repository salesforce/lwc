import { LightningElement, api } from 'lwc';
import { nameStateFactory } from 'x/state';

export default class TestSymbol extends LightningElement {
    @api connect;
    random = nameStateFactory();

    connectedCallback() {
        this.connect(this);
    }
}

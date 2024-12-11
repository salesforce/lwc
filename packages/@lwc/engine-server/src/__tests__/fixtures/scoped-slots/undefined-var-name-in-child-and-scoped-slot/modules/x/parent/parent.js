import { LightningElement } from 'lwc';

export default class Parent extends LightningElement {
    data = { id: 'do-not-use-me-either' };
    prop = { id: 'from-parent' };
}

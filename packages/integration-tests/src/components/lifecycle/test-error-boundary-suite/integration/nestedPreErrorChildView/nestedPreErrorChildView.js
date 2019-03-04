import { LightningElement } from 'lwc';

export default class PreErrorChildView extends LightningElement {
    renderedCallback() {
        throw new Error('Boundary Initial Child Offender Throws');
    }
}

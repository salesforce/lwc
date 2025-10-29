import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api show = false;

    errorCallback() {
        throw new Error(
            'error in the parent error callback after value mutation - note this will log in Firefox due to https://bugzilla.mozilla.org/1642147'
        );
    }
}

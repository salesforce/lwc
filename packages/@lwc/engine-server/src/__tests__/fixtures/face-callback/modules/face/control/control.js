import { LightningElement } from 'lwc';

export default class extends LightningElement {
    static formAssociated = true;

    formAssociatedCallback() {
        throw new Error('formAssociatedCallback should not be reachable in SSR');
    }

    formDisabledCallback() {
        throw new Error('formDisabledCallback should not be reachable in SSR');
    }

    formResetCallback() {
        throw new Error('formResetCallback should not be reachable in SSR');
    }
}
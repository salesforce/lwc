import { LightningElement } from 'lwc';

export default class DynamicScopedIds extends LightningElement {
    get activedescendant() {
        return 'activedescendant';
    }
    get controls() {
        return 'controls';
    }
    get describedby() {
        return 'describedby';
    }
    get details() {
        return 'details';
    }
    get errormessage() {
        return 'errormessage';
    }
    get flowto() {
        return 'flowto';
    }
    get labelledby() {
        return 'labelledby';
    }
    get owns() {
        return 'owns';
    }
    get forfor() {
        return 'for';
    }
}

import { LightningElement } from 'lwc';

export default class HrefDynamicUndefined extends LightningElement {
    get undef() {
        return undefined;
    }
}

import { LightningElement, track } from 'lwc';

export default class Container extends LightningElement {
    @track
    privateTabIndex = null;

    get privateTabIndexToString() {
        return String(this.privateTabIndex);
    }

    handleClick() {
        this.privateTabIndex = this.privateTabIndex === -1 ? null : -1;
    }
}

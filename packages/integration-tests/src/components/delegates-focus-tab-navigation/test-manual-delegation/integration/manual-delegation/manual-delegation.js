import { LightningElement, track } from 'lwc';

export default class Container extends LightningElement {
    @track
    privateTabIndex = 0;

    handleClick() {
        this.privateTabIndex = this.privateTabIndex === 0 ? -1 : 0;
    }
}

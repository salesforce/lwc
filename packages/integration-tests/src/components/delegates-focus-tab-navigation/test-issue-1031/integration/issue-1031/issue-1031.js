import { LightningElement, track } from 'lwc';

export default class Container extends LightningElement {
    @track
    computedTabIndex = 0;

    handleClick() {
        this.computedTabIndex = 0;
    }

    handleFocusOut() {
        // Changes the tabindex in the middle of delegatesFocus simulation!
        this.computedTabIndex = -1;
    }
}

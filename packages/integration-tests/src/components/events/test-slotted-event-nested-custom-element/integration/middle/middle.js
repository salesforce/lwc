import { LightningElement, track } from 'lwc';

export default class Middle extends LightningElement {
    @track eventTagName;
    handleClick(evt) {
        this.eventTagName = evt.target.tagName;
    }
}

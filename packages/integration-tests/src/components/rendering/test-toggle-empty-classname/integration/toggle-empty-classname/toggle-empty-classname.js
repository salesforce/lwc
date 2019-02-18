import { LightningElement, track } from 'lwc';

export default class EmptyClassname extends LightningElement {
    @track computedClassName = 'foo';

    handleClick() {
        this.computedClassName = '';
    }
}

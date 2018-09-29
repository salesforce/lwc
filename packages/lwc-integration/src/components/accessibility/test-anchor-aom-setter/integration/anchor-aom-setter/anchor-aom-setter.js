import { LightningElement, track } from 'lwc';

export default class AnchorAOMSetter extends LightningElement {
    @track errorText = 'no error';
    handleClick() {
        try {
            this.template.querySelector('a').ariaLabel = 'label';
        } catch (e) {
            this.errorText = e.message;
        }
    }
}

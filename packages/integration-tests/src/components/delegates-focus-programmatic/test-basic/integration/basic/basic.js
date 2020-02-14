import { LightningElement } from 'lwc';

export default class Container extends LightningElement {
    handleClick() {
        this.template.querySelector('integration-child').focus();
    }
}

import { LightningElement, api, track } from 'lwc';

export default class Child extends LightningElement {
    @api foo;
    @track errorMessage = '';

    handleClick() {
        try {
            this.foo.x = 'bar';
        } catch (e) {
            this.errorMessage = e.message;
        }
    }
}

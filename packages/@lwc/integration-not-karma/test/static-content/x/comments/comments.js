import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api
    fooWasClicked;

    @api
    barWasClicked;

    onClickFoo() {
        this.fooWasClicked = true;
    }

    onClickBar() {
        this.barWasClicked = true;
    }

    @api
    getRefs() {
        return this.refs;
    }
}

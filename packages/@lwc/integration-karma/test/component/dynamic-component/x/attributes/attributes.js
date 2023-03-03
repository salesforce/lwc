import { LightningElement, api } from 'lwc';
import Bar from 'x/bar';
import Foo from 'x/foo';

export default class extends LightningElement {
    fooCtor;
    barCtor;

    @api
    clickEvtSrcElement = null;

    connectedCallback() {
        this.fooCtor = Foo;
        this.barCtor = Bar;
    }

    renderedCallback() {
        if (this.refs.barRef) {
            this.refs.barRef.classList.add('slds-more-snazzy');
            this.refs.barRef.addEventListener('click', this.handleClick.bind(this));
        }
    }

    @api
    handleClick(evt) {
        this.clickEvtSrcElement = evt.target.tagName.toLowerCase();
    }
}

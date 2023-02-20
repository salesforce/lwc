import { LightningElement, api } from 'lwc';
import Bar from 'x/bar';
import Foo from 'x/foo';

export default class extends LightningElement {
    fooCtor;
    barCtor;

    connectedCallback() {
        this.fooCtor = Foo;
        this.barCtor = Bar;
    }

    renderedCallback() {
        if (this.refs.barRef) {
            this.refs.barRef.classList.add('slds-more-snazzy');
            // eslint-disable-next-line no-console
            this.refs.barRef.addEventListener('click', () => console.log('refs click called'));
        }
    }

    @api
    handleClick() {
        // eslint-disable-next-line no-console
        console.log('template click called');
    }
}

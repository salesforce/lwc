import { LightningElement, api } from 'lwc';
import Child from 'x/child';

export default class Test extends LightningElement {
    simpleProps = { name: 'LWC', onclick: this.spreadClick };
    overriddenProps = { name: 'Aura', onclick: this.spreadClick };
    spanProps = { className: 'spanclass' };
    dynamicCtor = Child;
    dynamicProps = { name: 'Dynamic' };

    spreadClick() {
        // eslint-disable-next-line no-console
        console.log('spread click called', this);
    }

    templateClick() {
        // eslint-disable-next-line no-console
        console.log('template click called', this);
    }

    @api modify(fn) {
        fn.call(this);
    }
}

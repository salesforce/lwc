import { LightningElement } from 'lwc';

export default class Test extends LightningElement {
    simpleProps = { name: 'LWC', onclick: this.spreadClick };
    overriddenProps = { name: 'Aura', onclick: this.spreadClick };
    spanProps = { className: 'spanclass' };

    spreadClick() {
        // eslint-disable-next-line no-console
        console.log('spread click called', this);
    }

    templateClick() {
        // eslint-disable-next-line no-console
        console.log('template click called', this);
    }
}

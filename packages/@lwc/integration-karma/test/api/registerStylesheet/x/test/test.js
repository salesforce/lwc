import { LightningElement, registerStylesheet, registerTemplate } from 'lwc';

export default class Test extends LightningElement {
    connectedCallback() {
        registerStylesheet(() => '');
        registerTemplate(() => []);
    }
}

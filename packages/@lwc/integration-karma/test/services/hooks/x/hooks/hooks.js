import { LightningElement, api } from 'lwc';

export default class ServiceHooks extends LightningElement {
    @api cb = () => {};

    connectedCallback() {
        this.cb('component-connected');
    }
    disconnectedCallback() {
        this.cb('component-disconnected');
    }
    renderedCallback() {
        this.cb('component-rendered');
    }
}

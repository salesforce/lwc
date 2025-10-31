import { LightningElement, api } from 'lwc';

export default class Child extends LightningElement {
    @api isServer;

    get things() {
        return this.isServer ? ['foo'] : ['foo', 'bar'];
    }
}

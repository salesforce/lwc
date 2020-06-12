import { LightningElement } from 'lwc';

export default class GetterIsConnected extends LightningElement {
    isComponentConnected;

    connectedCallback() {
        this.isComponentConnected = this.isConnected;
    }
}
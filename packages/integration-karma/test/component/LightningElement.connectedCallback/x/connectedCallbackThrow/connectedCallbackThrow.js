import { LightningElement } from 'lwc';

export default class ConnectedCallbackThrow extends LightningElement {
    connectedCallback() {
        throw new Error('throw in connected');
    }
}

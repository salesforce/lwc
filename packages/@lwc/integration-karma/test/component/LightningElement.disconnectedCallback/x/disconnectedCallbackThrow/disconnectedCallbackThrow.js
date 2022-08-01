import { LightningElement } from 'lwc';

export default class DisconnectedCallbackThrow extends LightningElement {
    disconnectedCallback() {
        throw new Error('throw in disconnected');
    }
}

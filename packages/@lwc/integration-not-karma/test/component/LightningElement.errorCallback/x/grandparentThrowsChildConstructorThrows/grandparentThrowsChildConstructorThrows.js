import { LightningElement } from 'lwc';
export default class extends LightningElement {
    errorCallback() {
        throw new Error('error in the grandparent error callback');
    }
}

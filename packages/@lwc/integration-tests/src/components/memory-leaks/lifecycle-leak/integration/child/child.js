import { LightningElement } from 'lwc';

// This is just so we can find the leaking object later
class VeryUniqueObjectName {}
window.VeryUniqueObjectName = VeryUniqueObjectName;

export default class extends LightningElement {
    _object = new VeryUniqueObjectName();
}

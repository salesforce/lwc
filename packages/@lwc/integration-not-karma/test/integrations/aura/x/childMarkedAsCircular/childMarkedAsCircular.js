import { LightningElement, track, api } from 'lwc';
class Child extends LightningElement {
    normalProperty;

    @track
    aTrackedProperty = 'Hello, welcome to the child component';

    @api
    aPublicProperty;
}

export default function tmp() {
    return Child;
}
tmp.__circular__ = true;

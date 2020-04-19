import { LightningElement } from 'lwc';
class Child extends LightningElement {}

export default function tmp() {
    return Child;
}
tmp.__circular__ = true;

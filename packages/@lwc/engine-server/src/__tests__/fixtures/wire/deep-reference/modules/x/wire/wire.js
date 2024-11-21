import { LightningElement, wire } from 'lwc';
import { adapter } from './adapter';

export default class Wire extends LightningElement {
    @wire(adapter, {
        deep: "$one.two.three",
    })
    wiredProp;

    one = {
        two: {
            three: 'yolo'
        }
    }
}

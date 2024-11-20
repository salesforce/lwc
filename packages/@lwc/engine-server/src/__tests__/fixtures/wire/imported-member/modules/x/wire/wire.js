import { LightningElement, wire } from 'lwc';
import Imported from './adapter';

export default class Wire extends LightningElement {
    @wire(Imported.Adapter, {
        value: "$cmpProp",
    })
    wiredProp;

    cmpProp = 'yolo'
}

import { LightningElement, wire } from 'lwc';
import { WireAdapter } from 'x/simpleProvider';

export default class ConsumerElement extends LightningElement {
    @wire(WireAdapter) context;
}

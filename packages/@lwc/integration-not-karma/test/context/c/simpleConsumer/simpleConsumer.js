import { LightningElement, wire } from 'lwc';
import { WireAdapter } from 'c/simpleProvider';

export default class ConsumerElement extends LightningElement {
    @wire(WireAdapter) context;
}

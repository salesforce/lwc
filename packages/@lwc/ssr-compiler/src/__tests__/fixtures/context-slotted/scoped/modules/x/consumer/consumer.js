import { LightningElement, wire } from 'lwc';
import { WireAdapter } from '../../../wire-adapter';

export default class SlottedConsumerComponent extends LightningElement {
    static renderMode = 'light';
    @wire(WireAdapter) foo;
}

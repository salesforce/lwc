import { LightningElement, wire } from 'lwc';
import { WireAdapter } from '../../../wire-adapter';

export default class ConsumerComponent extends LightningElement {
  @wire(WireAdapter, { unused: '$definitelyUnused' }) foo;
}

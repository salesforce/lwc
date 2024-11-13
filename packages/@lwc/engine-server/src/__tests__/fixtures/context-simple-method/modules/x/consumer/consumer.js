import { LightningElement, wire } from 'lwc';
import { WireAdapter } from '../../../wire-adapter';

export default class ConsumerComponent extends LightningElement {
  foo;

  @wire(WireAdapter, { unused: '$definitelyUnused' })
  calledWithWireInfo(newValue) {
    this.foo = newValue;
  }
}
